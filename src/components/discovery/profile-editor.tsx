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
import type { Category, FeaturedContent, Profile, Project, SocialLink } from "@/src/lib/discovery/types";
import { AvatarUpload } from "@/src/components/discovery/avatar-upload";
import { FeaturedContentEditor } from "@/src/components/discovery/featured-content-editor";
import { cn } from "@/src/lib/utils";

const selectClass =
  "h-11 w-full rounded-2xl border border-white/[0.1] bg-[#0d0c12] px-3 text-sm text-white";

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
        username: form.get("username"),
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
          <h1 className="mt-3 font-[family-name:var(--font-zg-display)] text-4xl text-white">Edit profile</h1>
        </div>
      </header>

      {suggestions.length ? (
        <ul className="space-y-1 text-sm text-white/45">
          {suggestions.map((item) => (
            <li key={item.key}>
              <a href={item.href} className="hover:text-white">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <EditorSection id="photo" title="Profile">
        <div className="mb-6">
          <AvatarUpload userId={userId} name={profile.displayName} currentUrl={profile.avatarUrl} />
        </div>
        <form className="space-y-4" onSubmit={saveProfile}>
          <Field label="Name">
            <Input name="displayName" defaultValue={profile.displayName} required />
          </Field>
          <Field label="Username">
            <Input name="username" defaultValue={profile.username ?? ""} required />
          </Field>
          <Field label="Bio">
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </Field>
          <Field label="Birthday (optional, 18+)">
            <Input name="birthDate" type="date" defaultValue={profile.birthDate ?? ""} />
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
          <Field label="Audience size (optional)">
            <Input name="audienceSize" type="number" min={0} defaultValue={profile.audienceSize ?? ""} />
          </Field>
          <Button type="submit">Save profile</Button>
        </form>
      </EditorSection>

      <EditorSection id="niches" title="Niches">
        <p className="mb-4 text-sm text-white/40">Primary niche is the first one you select.</p>
        <NichePicker categories={categories} selected={selectedCategoryIds} onSave={saveNiches} />
      </EditorSection>

      <EditorSection id="projects" title="Projects">
        <ProjectList projects={projects} />
      </EditorSection>

      <EditorSection id="social" title="Socials">
        <SocialEditor links={socialLinks} />
      </EditorSection>

      <EditorSection id="featured" title="Featured content">
        <FeaturedContentEditor profileId={profile.id} items={featuredContent} />
      </EditorSection>

      {message ? <p className="text-sm text-white/50">{message}</p> : null}
    </div>
  );
}

function EditorSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <h2 className="mb-5 font-[family-name:var(--font-zg-display)] text-2xl text-white">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</span>
      {children}
    </label>
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

function ProjectList({ projects }: { projects: Project[] }) {
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
        status: form.get("status"),
        featuredProject: projects.length === 0,
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
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="flex items-start justify-between gap-3 py-2">
          <div>
            <p className="text-sm font-medium text-white">{project.name}</p>
            <p className="text-xs text-white/40">
              {PROJECT_STATUS_LABELS[project.status]}
              {project.featuredProject ? " · Currently building" : ""}
            </p>
          </div>
          <button type="button" className="text-xs text-white/35" onClick={() => remove(project.id)}>
            Remove
          </button>
        </div>
      ))}
      <form className="space-y-3" onSubmit={create}>
        <Input name="name" placeholder="Project name" required />
        <Input name="url" placeholder="https://" />
        <Input name="description" placeholder="Short description" />
        <select name="status" className={selectClass}>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PROJECT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <Button type="submit">Add project</Button>
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
      <Button type="submit">Save links</Button>
    </form>
  );
}
