import type { SupabaseClient } from "@supabase/supabase-js";
import { AUDIENCE_RANGES, DISCOVERY_PAGE_SIZE, PROFILE_TYPE_LABELS, PROFILE_TYPES } from "@/src/lib/discovery/constants";
import { mapProfileAnalytics, parseAnalyticsRange } from "@/src/lib/discovery/analytics";
import { blockStatLabel, mapConversionMetrics } from "@/src/lib/discovery/conversion";
import { connectionStatusForViewer } from "@/src/lib/discovery/connections";
import { applyDiscoveryFilters } from "@/src/lib/discovery/apply-filters";
import { birthDateBounds, sanitizeIlike } from "@/src/lib/discovery/media";
import {
  mapCategory,
  mapFeaturedContent,
  mapProfile,
  mapProfileBlock,
  mapProject,
  mapSocialLink,
} from "@/src/lib/discovery/mappers";
import { mixDiscoverFeed } from "@/src/lib/discovery/mix";
import { relaxExploreFilters, sortDiscoveryFeed } from "@/src/lib/discovery/sort-feed";
import { sortByRising } from "@/src/lib/discovery/scoring";
import type {
  Category,
  ExploreFilters,
  FeaturedContent,
  Profile,
  ProfileCardModel,
  ProfileAnalytics,
  Project,
  PublicProfileModel,
  SocialLink,
  ConnectionUiStatus,
} from "@/src/lib/discovery/types";

const PROFILE_SELECT = "*";

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_index", { ascending: true });
  if (error || !data) return [];
  return data.map(mapCategory);
}

export async function getCategoryBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return data ? mapCategory(data) : null;
}

export async function getCategoryProfileCounts(supabase: SupabaseClient) {
  const { data: publicProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_public", true)
    .eq("is_disabled", false);
  const ids = (publicProfiles ?? []).map((row) => String((row as { id: string }).id));
  const counts = new Map<string, number>();
  if (!ids.length) return counts;
  const { data } = await supabase.from("profile_categories").select("category_id").in("profile_id", ids);
  for (const row of data ?? []) {
    const id = String((row as { category_id: string }).category_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

async function hydrateCards(
  supabase: SupabaseClient,
  profiles: Profile[],
  viewerId?: string | null,
): Promise<ProfileCardModel[]> {
  if (!profiles.length) return [];
  const ids = profiles.map((p) => p.id);
  const categoryIds = [...new Set(profiles.map((p) => p.primaryCategoryId).filter(Boolean))] as string[];

  const [projectsRes, linksRes, catsRes, followsRes, savedRes, featuredRes, membershipRes, connectionsRes] = await Promise.all([
    supabase.from("projects").select("*").in("owner_id", ids).eq("featured_project", true),
    supabase.from("social_links").select("*").in("profile_id", ids).order("sort_index"),
    categoryIds.length
      ? supabase.from("categories").select("*").in("id", categoryIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    viewerId
      ? supabase.from("follows").select("following_id").eq("follower_id", viewerId).in("following_id", ids)
      : Promise.resolve({ data: [] as { following_id: string }[] }),
    viewerId
      ? supabase.from("saved_profiles").select("profile_id").eq("user_id", viewerId).in("profile_id", ids)
      : Promise.resolve({ data: [] as { profile_id: string }[] }),
    supabase.from("featured_content").select("*").in("profile_id", ids).order("sort_index"),
    supabase.from("profile_categories").select("profile_id, categories(slug)").in("profile_id", ids),
    viewerId
      ? supabase
          .from("connections")
          .select("requester_id, receiver_id, status")
          .or(`requester_id.eq.${viewerId},receiver_id.eq.${viewerId}`)
      : Promise.resolve({ data: [] as { requester_id: string; receiver_id: string; status: string }[] }),
  ]);

  const featuredByOwner = new Map<string, Project>();
  for (const row of projectsRes.data ?? []) {
    const project = mapProject(row as Record<string, unknown>);
    featuredByOwner.set(project.ownerId, project);
  }
  const linksByProfile = new Map<string, SocialLink[]>();
  for (const row of linksRes.data ?? []) {
    const link = mapSocialLink(row as Record<string, unknown>);
    const list = linksByProfile.get(link.profileId) ?? [];
    list.push(link);
    linksByProfile.set(link.profileId, list);
  }
  const featuredPreviewByProfile = new Map<string, FeaturedContent>();
  for (const row of featuredRes.data ?? []) {
    const item = mapFeaturedContent(row as Record<string, unknown>);
    const current = featuredPreviewByProfile.get(item.profileId);
    const score = (candidate: FeaturedContent) =>
      candidate.platform === "youtube" ? 3 : candidate.thumbnailUrl ? 2 : 1;
    if (!current || score(item) > score(current)) featuredPreviewByProfile.set(item.profileId, item);
  }
  const cats = new Map((catsRes.data ?? []).map((row) => [String((row as { id: string }).id), mapCategory(row as Record<string, unknown>)]));
  const followed = new Set((followsRes.data ?? []).map((row) => row.following_id));
  const saved = new Set((savedRes.data ?? []).map((row) => row.profile_id));
  const connectionsByProfile = new Map<string, ConnectionUiStatus>();
  if (viewerId) {
    for (const row of connectionsRes.data ?? []) {
      const otherId = row.requester_id === viewerId ? row.receiver_id : row.requester_id;
      if (!ids.includes(otherId)) continue;
      connectionsByProfile.set(otherId, connectionStatusForViewer(viewerId, row));
    }
  }
  const slugsByProfile = new Map<string, string[]>();
  for (const row of membershipRes.data ?? []) {
    const rec = row as { profile_id: string; categories: { slug: string } | { slug: string }[] | null };
    const cat = Array.isArray(rec.categories) ? rec.categories[0] : rec.categories;
    if (!cat?.slug) continue;
    const list = slugsByProfile.get(rec.profile_id) ?? [];
    list.push(cat.slug);
    slugsByProfile.set(rec.profile_id, list);
  }

  return profiles.map((profile) => ({
    ...profile,
    primaryCategory: profile.primaryCategoryId ? cats.get(profile.primaryCategoryId) ?? null : null,
    featuredProject: featuredByOwner.get(profile.id) ?? null,
    featuredPreview: featuredPreviewByProfile.get(profile.id) ?? null,
    socialLinks: linksByProfile.get(profile.id) ?? [],
    categorySlugs: slugsByProfile.get(profile.id) ?? [],
    followedByMe: followed.has(profile.id),
    savedByMe: saved.has(profile.id),
    connectionStatus: connectionsByProfile.get(profile.id) ?? "none",
  }));
}

export type DiscoveryFeedPage = {
  profiles: ProfileCardModel[];
  related: ProfileCardModel[];
  hasMore: boolean;
  nextOffset: number;
  total: number;
};

export async function getDiscoveryFeedPage(
  supabase: SupabaseClient,
  input: {
    filters: ExploreFilters;
    favoriteSlugs?: string[];
    viewerId?: string | null;
    offset?: number;
    limit?: number;
  },
): Promise<DiscoveryFeedPage> {
  const offset = Math.max(0, input.offset ?? 0);
  const limit = Math.min(80, Math.max(1, input.limit ?? DISCOVERY_PAGE_SIZE));
  const favoriteSlugs = input.favoriteSlugs ?? [];
  const pool = (await listDiscoverableProfiles(supabase, input.viewerId)).filter(
    (card) => card.id !== input.viewerId,
  );
  const exact = applyDiscoveryFilters(pool, input.filters);
  const sorted = sortDiscoveryFeed(exact, input.filters.activity, favoriteSlugs, input.filters.niche);
  const profiles = sorted.slice(offset, offset + limit);

  let related: ProfileCardModel[] = [];
  if (!sorted.length && offset === 0) {
    for (const relaxed of relaxExploreFilters(input.filters)) {
      const next = applyDiscoveryFilters(pool, relaxed);
      if (!next.length) continue;
      related = sortDiscoveryFeed(next, input.filters.activity, favoriteSlugs, relaxed.niche).slice(0, 8);
      break;
    }
    if (!related.length) {
      related = mixDiscoverFeed(pool, favoriteSlugs).slice(0, 8);
    }
  }

  return {
    profiles,
    related,
    hasMore: offset + profiles.length < sorted.length,
    nextOffset: offset + profiles.length,
    total: sorted.length,
  };
}

export async function listDiscoverableProfiles(
  supabase: SupabaseClient,
  viewerId?: string | null,
): Promise<ProfileCardModel[]> {
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("is_public", true)
    .eq("is_disabled", false)
    .order("created_at", { ascending: false })
    .limit(200);
  const profiles = (data ?? []).map((row) => mapProfile(row as Record<string, unknown>));
  return hydrateCards(supabase, profiles, viewerId);
}

export async function listCategoryProfiles(
  supabase: SupabaseClient,
  slug: string,
  filters: ExploreFilters,
  viewerId?: string | null,
): Promise<ProfileCardModel[]> {
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) return [];

  const { data: membership } = await supabase
    .from("profile_categories")
    .select("profile_id")
    .eq("category_id", category.id);
  let ids = [...new Set((membership ?? []).map((row) => String((row as { profile_id: string }).profile_id)))];
  if (!ids.length) return [];

  if (filters.platform) {
    const { data: social } = await supabase
      .from("social_links")
      .select("profile_id")
      .eq("platform", filters.platform)
      .in("profile_id", ids);
    ids = [...new Set((social ?? []).map((row) => String((row as { profile_id: string }).profile_id)))];
    if (!ids.length) return [];
  }

  let query = supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("is_public", true)
    .eq("is_disabled", false)
    .in("id", ids);

  if (filters.profileType) query = query.eq("profile_type", filters.profileType);

  if (filters.location) {
    const loc = sanitizeIlike(filters.location);
    if (loc) query = query.or(`country.ilike.%${loc}%,location.ilike.%${loc}%`);
  }

  if (filters.audience) {
    const range = AUDIENCE_RANGES.find((item) => item.id === filters.audience);
    if (range) {
      query = query.gte("audience_size", range.min);
      if (range.max != null) query = query.lte("audience_size", range.max);
    }
  }

  const age = birthDateBounds(filters.age);
  if (age) {
    query = query.not("birth_date", "is", null).lte("birth_date", age.maxBirth);
    if (age.minBirth) query = query.gt("birth_date", age.minBirth);
  }

  const activity = filters.activity ?? "rising";
  if (activity === "new") query = query.order("created_at", { ascending: false });
  else if (activity === "most-followed") query = query.order("followers_count", { ascending: false });
  else if (activity === "recently-active") query = query.order("updated_at", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query.limit(150);
  let cards = await hydrateCards(
    supabase,
    (data ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
    viewerId,
  );
  if (activity === "rising") cards = sortByRising(cards);
  return cards;
}

export async function getExplorePayload(
  supabase: SupabaseClient,
  input: {
    viewer: Profile | null;
    favoriteSlugs: string[];
    filters: ExploreFilters;
    viewerLocation?: string | null;
  },
) {
  const all = applyDiscoveryFilters(
    await listDiscoverableProfiles(supabase, input.viewer?.id),
    input.filters,
  ).filter((card) => card.id !== input.viewer?.id);

  const activitySorted = sortDiscoveryFeed(
    all,
    input.filters.activity,
    input.favoriteSlugs,
    input.filters.niche,
  );

  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const nearYou = input.viewerLocation
    ? activitySorted.filter((card) =>
        `${card.location ?? ""} ${card.country ?? ""}`
          .toLowerCase()
          .includes(input.viewerLocation!.toLowerCase()),
      )
    : [];

  const pick = (list: ProfileCardModel[], n = 12) => list.slice(0, n);

  return {
    all: activitySorted,
    rising: pick(sortByRising(activitySorted)),
    newProfiles: pick(
      [...activitySorted].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    ),
    worthDiscovering: pick(
      activitySorted.filter((card) => card.editorPick || card.isFeatured),
    ),
    popular: pick([...activitySorted].sort((a, b) => b.followersCount - a.followersCount)),
    under5k: pick(activitySorted.filter((card) => card.audienceSize != null && card.audienceSize < 5000)),
    nearYou: pick(nearYou),
    recentlyJoined: pick(activitySorted.filter((card) => +new Date(card.createdAt) >= fourteenDaysAgo)),
    feed: activitySorted,
    favoriteSlugs: input.favoriteSlugs,
  };
}

export async function getFavoriteCategorySlugs(supabase: SupabaseClient, profileId: string) {
  const { data } = await supabase
    .from("profile_categories")
    .select("category_id, is_favorite, categories(slug)")
    .eq("profile_id", profileId);
  const slugs: string[] = [];
  for (const row of data ?? []) {
    const rec = row as { is_favorite: boolean; categories: { slug: string } | { slug: string }[] | null };
    const cat = Array.isArray(rec.categories) ? rec.categories[0] : rec.categories;
    if (cat?.slug && rec.is_favorite) slugs.push(cat.slug);
  }
  return slugs;
}

async function assemblePublicProfile(
  supabase: SupabaseClient,
  profile: Profile,
  viewerId?: string | null,
): Promise<PublicProfileModel | null> {
  if (profile.isDisabled && profile.id !== viewerId) return null;
  const [cards, catsRes, projectsRes, featuredRes, blocksRes] = await Promise.all([
    hydrateCards(supabase, [profile], viewerId),
    supabase.from("profile_categories").select("categories(*)").eq("profile_id", profile.id),
    supabase.from("projects").select("*").eq("owner_id", profile.id).order("sort_index"),
    supabase.from("featured_content").select("*").eq("profile_id", profile.id).order("sort_index"),
    supabase
      .from("profile_blocks")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("sort_index"),
  ]);
  const card = cards[0];
  if (!card) return null;
  const categories: Category[] = [];
  for (const row of catsRes.data ?? []) {
    const nested = (row as { categories: Record<string, unknown> | Record<string, unknown>[] | null }).categories;
    const catRow = Array.isArray(nested) ? nested[0] : nested;
    if (catRow) categories.push(mapCategory(catRow));
  }
  return {
    ...card,
    categories,
    projects: (projectsRes.data ?? []).map((row) => mapProject(row as Record<string, unknown>)),
    featuredContent: (featuredRes.data ?? []).map((row) => mapFeaturedContent(row as Record<string, unknown>)),
    blocks: (blocksRes.data ?? []).map((row) => mapProfileBlock(row as Record<string, unknown>)),
  };
}

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string,
  viewerId?: string | null,
): Promise<PublicProfileModel | null> {
  const { data } = await supabase.from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle();
  if (!data) return null;
  return assemblePublicProfile(supabase, mapProfile(data), viewerId);
}

export async function getPublicProfileById(
  supabase: SupabaseClient,
  profileId: string,
  viewerId?: string | null,
): Promise<PublicProfileModel | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", profileId).maybeSingle();
  if (!data) return null;
  return assemblePublicProfile(supabase, mapProfile(data), viewerId);
}

export async function getOwnedRelations(supabase: SupabaseClient, profileId: string) {
  const [projects, social, featured, categories, blocks] = await Promise.all([
    supabase.from("projects").select("*").eq("owner_id", profileId).order("sort_index"),
    supabase.from("social_links").select("*").eq("profile_id", profileId).order("sort_index"),
    supabase.from("featured_content").select("*").eq("profile_id", profileId).order("sort_index"),
    supabase.from("profile_categories").select("category_id, is_favorite").eq("profile_id", profileId),
    supabase.from("profile_blocks").select("*").eq("profile_id", profileId).order("sort_index"),
  ]);
  return {
    projects: (projects.data ?? []).map((row) => mapProject(row as Record<string, unknown>)),
    socialLinks: (social.data ?? []).map((row) => mapSocialLink(row as Record<string, unknown>)),
    featuredContent: (featured.data ?? []).map((row) => mapFeaturedContent(row as Record<string, unknown>)),
    categoryLinks: (categories.data ?? []) as { category_id: string; is_favorite: boolean }[],
    blocks: (blocks.data ?? []).map((row) => mapProfileBlock(row as Record<string, unknown>)),
  };
}

export async function getFollowedProfiles(supabase: SupabaseClient, viewerId: string) {
  const { data } = await supabase
    .from("follows")
    .select("following_id, created_at")
    .eq("follower_id", viewerId)
    .order("created_at", { ascending: false });
  const ids = (data ?? []).map((row) => row.following_id as string);
  if (!ids.length) return [];
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
  return hydrateCards(
    supabase,
    (profiles ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
    viewerId,
  );
}

export async function getSavedProfiles(supabase: SupabaseClient, viewerId: string) {
  const { data } = await supabase
    .from("saved_profiles")
    .select("profile_id, created_at")
    .eq("user_id", viewerId)
    .order("created_at", { ascending: false });
  const ids = (data ?? []).map((row) => row.profile_id as string);
  if (!ids.length) return [];
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
  return hydrateCards(
    supabase,
    (profiles ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
    viewerId,
  );
}

export async function searchDiscovery(supabase: SupabaseClient, query: string, viewerId?: string | null) {
  const q = query.trim().replace(/[%_,()]/g, " ").slice(0, 80);
  if (q.length < 2) {
    const suggestions = mixDiscoverFeed(await listDiscoverableProfiles(supabase, viewerId), []).slice(0, 8);
    return {
      people: suggestions,
      projects: [] as (Project & { ownerUsername: string | null; ownerName: string })[],
      categories: [] as Category[],
      idle: true as const,
    };
  }

  const typeMatch = PROFILE_TYPES.find(
    (type) => type === q.toLowerCase() || PROFILE_TYPE_LABELS[type].toLowerCase() === q.toLowerCase(),
  );
  const peopleOr = [
    `display_name.ilike.%${q}%`,
    `username.ilike.%${q}%`,
    `bio.ilike.%${q}%`,
    `role_label.ilike.%${q}%`,
    typeMatch ? `profile_type.eq.${typeMatch}` : null,
  ]
    .filter(Boolean)
    .join(",");

  const [peopleRes, projectRes, catRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("is_public", true)
      .eq("is_disabled", false)
      .or(peopleOr)
      .limit(24),
    supabase.from("projects").select("*").ilike("name", `%${q}%`).limit(12),
    supabase.from("categories").select("*").eq("is_active", true).or(`name.ilike.%${q}%,slug.ilike.%${q}%,description.ilike.%${q}%`).limit(8),
  ]);

  let people = await hydrateCards(
    supabase,
    (peopleRes.data ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
    viewerId,
  );

  const ownerIds = [...new Set((projectRes.data ?? []).map((row) => String((row as { owner_id: string }).owner_id)))];
  const missingOwnerIds = ownerIds.filter((id) => !people.some((profile) => profile.id === id));
  if (missingOwnerIds.length) {
    const { data: extraOwners } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_public", true)
      .eq("is_disabled", false)
      .in("id", missingOwnerIds);
    const extra = await hydrateCards(
      supabase,
      (extraOwners ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
      viewerId,
    );
    people = [...people, ...extra];
  }

  const categories = (catRes.data ?? []).map((row) => mapCategory(row as Record<string, unknown>));
  const nicheMatch = categories[0];
  if (nicheMatch && !people.some((profile) => profile.categorySlugs?.includes(nicheMatch.slug))) {
    const nichePeople = applyDiscoveryFilters(await listDiscoverableProfiles(supabase, viewerId), {
      niche: nicheMatch.slug,
    }).slice(0, 8);
    const seen = new Set(people.map((profile) => profile.id));
    people = [...people, ...nichePeople.filter((profile) => !seen.has(profile.id))];
  }

  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, username, display_name, is_public, is_disabled").in("id", ownerIds)
    : { data: [] as Record<string, unknown>[] };
  const ownerMap = new Map(
    (owners ?? []).map((row) => [
      String(row.id),
      {
        username: (row.username as string | null) ?? null,
        name: String(row.display_name ?? ""),
        visible: row.is_public !== false && row.is_disabled !== true,
      },
    ]),
  );

  const projects = (projectRes.data ?? [])
    .map((row) => mapProject(row as Record<string, unknown>))
    .filter((project) => ownerMap.get(project.ownerId)?.visible)
    .map((project) => ({
      ...project,
      ownerUsername: ownerMap.get(project.ownerId)?.username ?? null,
      ownerName: ownerMap.get(project.ownerId)?.name ?? "",
    }));

  return {
    people,
    projects,
    categories,
    idle: false as const,
  };
}

export async function getIncomingConnectionRequests(supabase: SupabaseClient, viewerId: string) {
  const { data, error } = await supabase
    .from("connections")
    .select("id, requester_id, created_at")
    .eq("receiver_id", viewerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) return [];
  const rows = data ?? [];
  const ids = rows.map((row) => row.requester_id as string);
  if (!ids.length) return [];
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
  const cards = await hydrateCards(
    supabase,
    (profiles ?? []).map((row) => mapProfile(row as Record<string, unknown>)),
    viewerId,
  );
  const byId = new Map(cards.map((card) => [card.id, card]));
  return rows
    .map((row) => {
      const profile = byId.get(row.requester_id as string);
      if (!profile) return null;
      return { id: String(row.id), profile };
    })
    .filter((item): item is { id: string; profile: ProfileCardModel } => Boolean(item));
}

export async function getProfileAnalytics(
  supabase: SupabaseClient,
  profileId: string,
  range?: number | string | null,
): Promise<ProfileAnalytics | null> {
  const days = parseAnalyticsRange(range);
  const primary = await supabase.rpc("discovery_profile_analytics", {
    p_profile_id: profileId,
    p_range_days: days,
  });
  let raw = !primary.error ? primary.data : null;
  if (!raw) {
    const fallback = await supabase.rpc("discovery_profile_analytics", { p_profile_id: profileId });
    if (fallback.error || !fallback.data) return null;
    raw = fallback.data;
  }
  const traffic = await supabase.rpc("discovery_profile_traffic_sources", {
    p_profile_id: profileId,
    p_range_days: days,
  });
  if (!traffic.error && traffic.data && typeof traffic.data === "object") {
    raw = { ...(raw as object), ...(traffic.data as object) };
  }
  const conversions = await loadConversionMetrics(supabase, profileId, days, asNumberViews(raw));
  raw = { ...(raw as object), ...conversions };
  return mapProfileAnalytics(raw, days);
}

function asNumberViews(raw: unknown) {
  if (!raw || typeof raw !== "object") return 0;
  const row = raw as Record<string, unknown>;
  const n = typeof row.views === "number" ? row.views : Number(row.views ?? row.views_30d ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function loadConversionMetrics(
  supabase: SupabaseClient,
  profileId: string,
  days: number,
  views: number,
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const [eventsRes, blocksRes] = await Promise.all([
    supabase
      .from("discovery_events")
      .select("event_type, platform, content_id")
      .eq("profile_id", profileId)
      .in("event_type", ["profile_cta_click", "premium_block_click"])
      .gte("created_at", since),
    supabase.from("profile_blocks").select("id, block_type, title").eq("profile_id", profileId),
  ]);
  const blocks = new Map(
    (blocksRes.data ?? []).map((row) => [
      String((row as { id: string }).id),
      {
        type: String((row as { block_type?: string }).block_type ?? "custom"),
        title: ((row as { title?: string | null }).title as string | null) ?? null,
      },
    ]),
  );
  let ctaClicks = 0;
  const blockCounts = new Map<string, { key: string; label: string; count: number }>();
  for (const row of eventsRes.data ?? []) {
    const eventType = String((row as { event_type?: string }).event_type ?? "");
    if (eventType === "profile_cta_click") {
      ctaClicks += 1;
      continue;
    }
    if (eventType !== "premium_block_click") continue;
    const contentId = (row as { content_id?: string | null }).content_id
      ? String((row as { content_id: string }).content_id)
      : "";
    const platform = String((row as { platform?: string | null }).platform ?? "custom");
    const meta = contentId ? blocks.get(contentId) : undefined;
    const key = contentId || platform;
    const label = blockStatLabel(meta?.type || platform, meta?.title);
    const current = blockCounts.get(key) ?? { key, label, count: 0 };
    current.count += 1;
    blockCounts.set(key, current);
  }
  const mapped = mapConversionMetrics({
    views,
    ctaClicks,
    blockClicks: [...blockCounts.values()],
  });
  return {
    cta_clicks: mapped.ctaClicks,
    block_clicks: mapped.blockClicks,
  };
}

export async function getRecentViewSignals(supabase: SupabaseClient, profileIds: string[]) {
  if (!profileIds.length) return {} as Record<string, { views7d: number; follows7d: number }>;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [viewsRes, followsRes] = await Promise.all([
    supabase
      .from("discovery_events")
      .select("profile_id")
      .eq("event_type", "profile_view")
      .gte("created_at", since)
      .in("profile_id", profileIds),
    supabase.from("follows").select("following_id").gte("created_at", since).in("following_id", profileIds),
  ]);
  const map: Record<string, { views7d: number; follows7d: number }> = {};
  for (const id of profileIds) map[id] = { views7d: 0, follows7d: 0 };
  for (const row of viewsRes.data ?? []) {
    const id = String((row as { profile_id: string }).profile_id);
    if (map[id]) map[id].views7d += 1;
  }
  for (const row of followsRes.data ?? []) {
    const id = String((row as { following_id: string }).following_id);
    if (map[id]) map[id].follows7d += 1;
  }
  return map;
}
