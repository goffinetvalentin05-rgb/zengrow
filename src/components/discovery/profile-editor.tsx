"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import {
  FEATURED_PLATFORM_LABELS,
  FEATURED_PLATFORMS,
  MAX_FEATURED_CONTENT,
  MAX_NICHES,
  PROFILE_TYPE_LABELS,
  PROFILE_TYPES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
} from "@/src/lib/discovery/constants";
import { completenessSuggestions } from "@/src/lib/discovery/completeness";
import type { Category, FeaturedContent, Profile, Project, SocialLink } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

export function ProfileEditor({
  profile,
  categories,
  selectedCategoryIds,
  projects,
  socialLinks,
  featuredContent,
}: {
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
        avatarUrl: form.get("avatarUrl"),
        audienceSize: form.get("audienceSize"),
      }),
    });
    setMessage(response.ok ? "Profile saved." : "Could not save profile.");
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">My profile</h1>
          <p className="mt-1 text-sm text-white/40">Keep it short. People should see what you are building.</p>
        </div>
        {profile.username ? (
          <Link href={`/u/${profile.username}`} className="text-sm text-white/50 hover:text-white">
            Preview profile
          </Link>
        ) : null}
      </header>

      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/70">Profile completeness</p>
          <p className="text-sm text-white">{profile.completeness}%</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-white" style={{ width: `${profile.completeness}%` }} />
        </div>
        {suggestions.length ? (
          <ul className="mt-4 space-y-1 text-sm text-white/45">
            {suggestions.map((item) => (
              <li key={item.key}>
                <a href={item.href} className="hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <EditorCard id="photo" title="Profile">
        <form className="space-y-4" onSubmit={saveProfile}>
          <Field label="Photo URL">
            <Input name="avatarUrl" defaultValue={profile.avatarUrl ?? ""} placeholder="https://..." />
          </Field>
          <Field label="Name">
            <Input name="displayName" defaultValue={profile.displayName} required />
          </Field>
          <Field label="Username">
            <Input name="username" defaultValue={profile.username ?? ""} required />
          </Field>
          <Button type="submit">Save profile</Button>
        </form>
      </EditorCard>

      <EditorCard id="about" title="About">
        <form className="space-y-4" onSubmit={saveProfile}>
          <Field label="Short bio">
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.035] px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location">
              <Input name="location" defaultValue={profile.location ?? ""} />
            </Field>
            <Field label="Country">
              <Input name="country" defaultValue={profile.country ?? ""} />
            </Field>
          </div>
          <Field label="Profile type">
            <select
              name="profileType"
              defaultValue={profile.profileType ?? ""}
              className="h-10 w-full rounded-2xl border border-white/[0.1] bg-[#0d0c12] px-3 text-sm text-white"
            >
              <option value="">Select</option>
              {PROFILE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROFILE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Audience size (optional, self-reported)">
            <Input name="audienceSize" type="number" min={0} defaultValue={profile.audienceSize ?? ""} />
          </Field>
          <Button type="submit">Save about</Button>
        </form>
      </EditorCard>

      <EditorCard id="niches" title="Niches">
        <NichePicker categories={categories} selected={selectedCategoryIds} onSave={saveNiches} />
      </EditorCard>

      <EditorCard id="projects" title="Projects">
        <ProjectList projects={projects} />
      </EditorCard>

      <EditorCard id="social" title="Social links">
        <SocialEditor links={socialLinks} />
      </EditorCard>

      <EditorCard id="featured" title="Featured content">
        <FeaturedEditor items={featuredContent} />
      </EditorCard>

      {message ? <p className="text-sm text-white/50">{message}</p> : null}
    </div>
  );
}

function EditorCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <h2 className="mb-4 font-[family-name:var(--font-zg-display)] text-2xl text-white">{title}</h2>
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
                "rounded-full border px-3 py-1.5 text-sm",
                active ? "border-white bg-white text-zinc-950" : "border-white/10 text-white/60",
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
        category: form.get("category"),
        status: form.get("status"),
        featuredProject: true,
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
        <div key={project.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.06] p-3">
          <div>
            <p className="text-sm font-medium text-white">{project.name}</p>
            <p className="text-xs text-white/40">
              {PROJECT_STATUS_LABELS[project.status]}
              {project.featuredProject ? " · Featured" : ""}
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
        <Input name="category" placeholder="Category" />
        <select name="status" className="h-10 w-full rounded-2xl border border-white/[0.1] bg-[#0d0c12] px-3 text-sm text-white">
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
          <Input name={platform} defaultValue={byPlatform[platform] ?? ""} placeholder="https://" />
        </Field>
      ))}
      <Button type="submit">Save links</Button>
    </form>
  );
}

function FeaturedEditor({ items }: { items: FeaturedContent[] }) {
  const router = useRouter();
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/discovery/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: form.get("platform"),
        url: form.get("url"),
        title: form.get("title"),
        thumbnailUrl: form.get("thumbnailUrl"),
      }),
    });
    event.currentTarget.reset();
    router.refresh();
  }
  async function remove(id: string) {
    await fetch("/api/discovery/featured", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }
  return (
    <div className="space-y-4">
      <p className="text-xs text-white/35">
        Up to {MAX_FEATURED_CONTENT}. Content stays on the original platform — Sharpz only links to it.
      </p>
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] p-3">
          <div>
            <p className="text-sm text-white">{item.title || item.url}</p>
            <p className="text-xs text-white/35">{FEATURED_PLATFORM_LABELS[item.platform]}</p>
          </div>
          <button type="button" className="text-xs text-white/35" onClick={() => remove(item.id)}>
            Remove
          </button>
        </div>
      ))}
      {items.length < MAX_FEATURED_CONTENT ? (
        <form className="space-y-3" onSubmit={create}>
          <select name="platform" className="h-10 w-full rounded-2xl border border-white/[0.1] bg-[#0d0c12] px-3 text-sm text-white">
            {FEATURED_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {FEATURED_PLATFORM_LABELS[platform]}
              </option>
            ))}
          </select>
          <Input name="url" placeholder="https://" required />
          <Input name="title" placeholder="Optional title" />
          <Input name="thumbnailUrl" placeholder="Optional thumbnail URL" />
          <Button type="submit">Add content</Button>
        </form>
      ) : null}
    </div>
  );
}
