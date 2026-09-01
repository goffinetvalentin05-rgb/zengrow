import { youtubeThumbnailUrl, resolveFeaturedThumbnail } from "@/src/lib/discovery/media";
import type { ProfileCardModel } from "@/src/lib/discovery/types";

export type CardMedia = {
  heroUrl: string | null;
  heroKind: "youtube" | "featured" | "cover" | "none";
  youtubeUrl: string | null;
  projectLogo: string | null;
  projectName: string | null;
};

export function resolveCardMedia(profile: ProfileCardModel): CardMedia {
  const youtubeFeatured =
    profile.featuredPreview?.platform === "youtube" ? profile.featuredPreview : null;
  const youtubeSocial = profile.socialLinks.find((link) => link.platform === "youtube");
  const youtubeUrl = youtubeFeatured?.url || youtubeSocial?.url || null;
  const youtubeThumb = youtubeFeatured
    ? resolveFeaturedThumbnail(youtubeFeatured)
    : youtubeUrl
      ? youtubeThumbnailUrl(youtubeUrl)
      : null;

  const featuredThumb =
    profile.featuredPreview && profile.featuredPreview.platform !== "youtube"
      ? resolveFeaturedThumbnail(profile.featuredPreview)
      : null;

  if (youtubeThumb) {
    return {
      heroUrl: youtubeThumb,
      heroKind: "youtube",
      youtubeUrl,
      projectLogo: profile.featuredProject?.logoUrl ?? null,
      projectName: profile.featuredProject?.name ?? null,
    };
  }
  if (featuredThumb) {
    return {
      heroUrl: featuredThumb,
      heroKind: "featured",
      youtubeUrl,
      projectLogo: profile.featuredProject?.logoUrl ?? null,
      projectName: profile.featuredProject?.name ?? null,
    };
  }
  if (profile.coverImageUrl) {
    return {
      heroUrl: profile.coverImageUrl,
      heroKind: "cover",
      youtubeUrl,
      projectLogo: profile.featuredProject?.logoUrl ?? null,
      projectName: profile.featuredProject?.name ?? null,
    };
  }
  return {
    heroUrl: null,
    heroKind: "none",
    youtubeUrl,
    projectLogo: profile.featuredProject?.logoUrl ?? null,
    projectName: profile.featuredProject?.name ?? null,
  };
}
