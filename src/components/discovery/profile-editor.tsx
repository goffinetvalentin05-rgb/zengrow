"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import {
  MAX_NICHES,
  PROFILE_TYPE_LABELS,
  PROFILE_TYPES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
} from "@/src/lib/discovery/constants";
import { completenessSuggestions } from "@/src/lib/discovery/completeness";
import { COUNTRY_PRESETS } from "@/src/lib/discovery/media";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { PROFILE_THEMES, PROFILE_THEME_KEYS, PROFILE_LAYOUT_VARIANTS, PROFILE_LAYOUT_LABELS, isPageBackgroundKey, type ProfileLayoutVariant, type ProfileThemeKey } from "@/src/lib/discovery/appearance";
import type { Category, FeaturedContent, Profile, Project, SocialLink } from "@/src/lib/discovery/types";
import { AvatarUpload } from "@/src/components/discovery/avatar-upload";
import { CoverUpload } from "@/src/components/discovery/cover-upload";
import { PageBackgroundPicker } from "@/src/components/discovery/page-background-picker";
import { FeaturedContentEditor } from "@/src/components/discovery/featured-content-editor";
import { ProjectLogoUpload } from "@/src/components/discovery/project-logo-upload";
import { SharpzLinkEditor } from "@/src/components/discovery/sharpz-link-editor";
import { cn } from "@/src/lib/utils";

const selectClass =
  "sz-focus h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-3 text-sm text-white outline-none";

export function ProfileEditor({
  userId,
  profile,
  categories,
  selectedCategoryIds,
  projects,
  socialLinks,
  featuredContent,
}: {
  userId: string;
  profile: Profile;
  categories: Category[];
  selectedCategoryIds: string[];
  projects: Project[];
  socialLinks: SocialLink[];
  featuredContent: FeaturedContent[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const suggestions = completenessSuggestions({ profile, projects, socialLinks, featuredContent });

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        bio: form.get("bio"),
        location: form.get("location"),
        country: form.get("country"),
        profileType: form.get("profileType"),
        audienceSize: form.get("audienceSize"),
        birthDate: form.get("birthDate"),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setMessage(response.ok ? "Saved." : payload.error ?? "Could not save.");
    if (response.ok) router.refresh();
  }

  async function saveNiches(ids: string[]) {
    await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nicheIds: ids }),
    });
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-12 px-5 pb-10 md:px-0">
      <header className="flex items-end justify-between gap-4">
        <div>
          <Link href={DISCOVERY_ROUTES.me} className="text-sm text-white/40 hover:text-white">
            ← Preview
          </Link>
          <h1 className="sz-display mt-3">Edit profile</h1>
        </div>
      </header>

      {suggestions.length ? (
        <div className="rounded-[1.25rem] bg-white/[0.035] px-4 py-3.5 ring-1 ring-white/[0.06]">
          <div className="flex items-center justify-between">
            <p className="sz-label">Profile completeness</p>
            <p className="text-sm text-white">{profile.completeness}%</p>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-white/45">
            {suggestions.map((item) => (
              <li key={item.key}>
                <a href={item.href} className="hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <EditorSection id="profile" title="Profile">
        <div className="mb-6">
          <AvatarUpload userId={userId} name={profile.displayName} currentUrl={profile.avatarUrl} />
        </div>
        <form className="space-y-4" onSubmit={saveProfile}>
          <Field label="Name">
            <Input name="displayName" defaultValue={profile.displayName} required />
          </Field>
          {profile.username ? (
            <p className="text-sm text-white/40">
              @{profile.username}{" "}
              <a href="#link" className="text-white/60 hover:text-white">
                Change link
              </a>
            </p>
          ) : null}
          <Field label="Role">
            <select name="profileType" defaultValue={profile.profileType ?? ""} className={selectClass}>
              <option value="">Select</option>
              {PROFILE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROFILE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bio">
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <Input name="location" defaultValue={profile.location ?? ""} placeholder="Optional" />
            </Field>
            <Field label="Country">
              <select name="country" defaultValue={profile.country ?? ""} className={selectClass}>
                <option value="">Select</option>
                {COUNTRY_PRESETS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
                {profile.country && !(COUNTRY_PRESETS as readonly string[]).includes(profile.country) ? (
                  <option value={profile.country}>{profile.country}</option>
                ) : null}
              </select>
            </Field>
          </div>
          <details className="rounded-2xl bg-white/[0.02] px-3 py-2">
            <summary className="cursor-pointer text-sm text-white/40">More</summary>
            <div className="mt-3 space-y-4">
              <Field label="Birthday (optional, 18+)">
                <Input name="birthDate" type="date" defaultValue={profile.birthDate ?? ""} />
              </Field>
              <Field label="Audience size (optional)">
                <Input name="audienceSize" type="number" min={0} defaultValue={profile.audienceSize ?? ""} />
              </Field>
            </div>
          </details>
          <Button type="submit" className="sz-press">Save profile</Button>
        </form>
        <div className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Niche</p>
          <p className="mb-3 text-sm text-white/40">Primary niche is the first one you select.</p>
          <NichePicker categories={categories} selected={selectedCategoryIds} onSave={saveNiches} />
        </div>
      </EditorSection>

      <EditorSection id="appearance" title="Appearance">
        <p className="mb-5 text-sm text-white/40">A light identity for your public page. The page stays dark.</p>
        <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Page background</p>
        <p className="mb-4 text-sm text-white/40">Shown behind the whole profile. Header cover stays a separate strip at the top.</p>
        <PageBackgroundPicker
          userId={userId}
          value={isPageBackgroundKey(profile.pageBackgroundKey) ? profile.pageBackgroundKey : "void"}
          imageUrl={profile.pageBackgroundImageUrl}
          onSaved={() => router.refresh()}
        />
        <div className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Header cover</p>
          <CoverUpload userId={userId} currentUrl={profile.coverImageUrl} />
        </div>
        <div className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Theme</p>
          <ThemePicker
            value={(PROFILE_THEME_KEYS.includes(profile.themeKey as ProfileThemeKey)
              ? profile.themeKey
              : "obsidian") as ProfileThemeKey}
            onSaved={() => router.refresh()}
          />
        </div>
        <div className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Accent color</p>
          <AccentPicker value={profile.accentColor} onSaved={() => router.refresh()} />
        </div>
        <div className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">Content layout</p>
          <LayoutPicker
            value={
              PROFILE_LAYOUT_VARIANTS.includes(profile.layoutVariant as ProfileLayoutVariant)
                ? (profile.layoutVariant as ProfileLayoutVariant)
                : profile.featuredFirst
                  ? "content_first"
                  : "default"
            }
            onSaved={() => router.refresh()}
          />
        </div>
      </EditorSection>

      <EditorSection id="projects" title="Projects">
        <ProjectList userId={userId} projects={projects} />
      </EditorSection>

      <EditorSection id="featured" title="Featured content">
        <FeaturedContentEditor profileId={profile.id} items={featuredContent} />
      </EditorSection>

      <EditorSection id="social" title="Social links">
        <SocialEditor links={socialLinks} />
      </EditorSection>

      <EditorSection id="link" title="Sharpz link">
        <SharpzLinkEditor username={profile.username} />
      </EditorSection>

      {message ? <p className="text-sm text-white/50">{message}</p> : null}
    </div>
  );
}

function EditorSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <h2 className="sz-title mb-5">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="sz-label mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function ThemePicker({ value, onSaved }: { value: ProfileThemeKey; onSaved: () => void }) {
  const [current, setCurrent] = useState(value);

  async function select(key: ProfileThemeKey) {
    setCurrent(key);
    await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeKey: key }),
    });
    onSaved();
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {PROFILE_THEME_KEYS.map((key) => {
        const theme = PROFILE_THEMES[key];
        const active = current === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => void select(key)}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-left ring-1 transition",
              active ? "bg-white/[0.08] ring-white/25" : "bg-white/[0.03] ring-white/[0.06]",
            )}
          >
            <span className="h-8 w-8 rounded-full" style={{ background: theme.swatch }} />
            <span>
              <span className="block text-sm text-white">{theme.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AccentPicker({ value, onSaved }: { value: string | null; onSaved: () => void }) {
  const [color, setColor] = useState(value ?? "#f4f4f5");

  async function save(next: string | null) {
    await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accentColor: next ?? "" }),
    });
    onSaved();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="color"
        value={color}
        onChange={(event) => setColor(event.target.value)}
        onBlur={() => void save(color)}
        className="h-10 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
        aria-label="Accent color"
      />
      <Input
        value={color}
        onChange={(event) => setColor(event.target.value)}
        onBlur={() => void save(color)}
        className="w-32"
        spellCheck={false}
      />
      <Button type="button" variant="ghost" size="sm" onClick={() => { setColor("#f4f4f5"); void save(null); }}>
        Theme default
      </Button>
    </div>
  );
}

function LayoutPicker({ value, onSaved }: { value: ProfileLayoutVariant; onSaved: () => void }) {
  const [current, setCurrent] = useState(value);

  async function select(next: ProfileLayoutVariant) {
    setCurrent(next);
    await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layoutVariant: next }),
    });
    onSaved();
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {PROFILE_LAYOUT_VARIANTS.map((key) => {
        const active = current === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => void select(key)}
            className={cn(
              "rounded-2xl px-3 py-3 text-left text-sm ring-1 transition",
              active ? "bg-white/[0.08] text-white ring-white/25" : "bg-white/[0.03] text-white/70 ring-white/[0.06]",
            )}
          >
            {PROFILE_LAYOUT_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}

function NichePicker({
  categories,
  selected,
  onSave,
}: {
  categories: Category[];
  selected: string[];
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [ids, setIds] = useState(selected);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = ids.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setIds((current) => {
                  if (current.includes(cat.id)) return current.filter((id) => id !== cat.id);
                  if (current.length >= MAX_NICHES) return current;
                  return [...current, cat.id];
                })
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                active ? "bg-white text-zinc-950" : "bg-white/[0.06] text-white/60",
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
      <Button className="mt-4" type="button" onClick={() => onSave(ids)}>
        Save niches
      </Button>
    </div>
  );
}

function ProjectList({ userId, projects }: { userId: string; projects: Project[] }) {
  const router = useRouter();
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/discovery/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        url: form.get("url"),
        description: form.get("description"),
        category: form.get("category"),
        logoUrl: form.get("logoUrl"),
        status: form.get("status"),
        featuredProject: projects.length === 0 || form.get("featuredProject") === "on",
      }),
    });
    event.currentTarget.reset();
    router.refresh();
  }
  async function remove(id: string) {
    await fetch("/api/discovery/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }
  async function setFeatured(id: string) {
    await fetch("/api/discovery/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, featuredProject: true }),
    });
    router.refresh();
  }
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="space-y-3 rounded-2xl bg-white/[0.03] px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{project.name}</p>
              <p className="text-xs text-white/40">
                {PROJECT_STATUS_LABELS[project.status]}
                {project.featuredProject ? " · Currently building" : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-3 text-xs text-white/40">
              {!project.featuredProject ? (
                <button type="button" onClick={() => void setFeatured(project.id)}>
                  Feature
                </button>
              ) : null}
              <button type="button" onClick={() => remove(project.id)}>
                Remove
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-white/40">Project logo</p>
            <ProjectLogoUpload userId={userId} projectId={project.id} currentUrl={project.logoUrl} />
          </div>
        </div>
      ))}
      <form className="space-y-3" onSubmit={create}>
        <Input name="name" placeholder="Project name" required />
        <Input name="url" placeholder="https://" />
        <Input name="description" placeholder="Short description" />
        <Input name="category" placeholder="Category (optional)" />
        <Input name="logoUrl" placeholder="Logo URL (optional)" />
        <select name="status" className={selectClass}>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PROJECT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-white/55">
          <input type="checkbox" name="featuredProject" className="h-4 w-4" defaultChecked={projects.length === 0} />
          Currently building
        </label>
        <Button type="submit" className="sz-press">Add project</Button>
      </form>
    </div>
  );
}

function SocialEditor({ links }: { links: SocialLink[] }) {
  const router = useRouter();
  const byPlatform = Object.fromEntries(links.map((link) => [link.platform, link.url]));
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = SOCIAL_PLATFORMS.map((platform) => ({
      platform,
      url: String(form.get(platform) ?? "").trim(),
    })).filter((item) => item.url);
    await fetch("/api/discovery/social", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links: payload }),
    });
    router.refresh();
  }
  return (
    <form className="space-y-3" onSubmit={save}>
      {SOCIAL_PLATFORMS.map((platform) => (
        <Field key={platform} label={SOCIAL_PLATFORM_LABELS[platform]}>
          <Input
            name={platform}
            defaultValue={byPlatform[platform] ?? ""}
            placeholder={platform === "website" ? "https://" : `${platform}.com/username`}
          />
        </Field>
      ))}
      <Button type="submit" className="sz-press">Save links</Button>
    </form>
  );
}
