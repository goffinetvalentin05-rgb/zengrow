"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import type { Category, Profile, Project } from "@/src/lib/discovery/types";

type ClaimRow = { id: string; profile_id: string; status: string; proof_note: string | null; created_at: string };
type ReportRow = { id: string; profile_id: string; reason: string; status: string; created_at: string };
type SubRow = { user_id: string; plan: string; status: string };

export function AdminView({
  profiles,
  categories,
  projects,
  claims,
  reports,
  subscriptions,
}: {
  profiles: Profile[];
  categories: Category[];
  projects: Project[];
  claims: ClaimRow[];
  reports: ReportRow[];
  subscriptions: SubRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"profiles" | "categories" | "projects" | "reports" | "pro" | "claims">("profiles");

  async function patchProfile(id: string, patch: Record<string, unknown>) {
    await fetch("/api/discovery/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: "profile", id, patch }),
    });
    router.refresh();
  }

  async function createUnclaimed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/discovery/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "profile",
        displayName: form.get("displayName"),
        username: form.get("username"),
        bio: form.get("bio"),
        categoryId: form.get("categoryId"),
      }),
    });
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Admin</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["profiles", "categories", "projects", "claims", "reports", "pro"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full border px-3 py-1.5 text-sm ${tab === item ? "border-white bg-white text-zinc-950" : "border-white/10 text-white/50"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "profiles" ? (
        <div className="mt-8 space-y-6">
          <form className="grid gap-3 rounded-3xl border border-white/[0.07] p-4 sm:grid-cols-2" onSubmit={createUnclaimed}>
            <Input name="displayName" placeholder="Name" required />
            <Input name="username" placeholder="username" required />
            <Input name="bio" placeholder="Bio" />
            <select name="categoryId" className="h-10 rounded-2xl border border-white/10 bg-[#0d0c12] px-3 text-sm text-white">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button type="submit">Create unclaimed profile</Button>
          </form>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] p-3">
                <div>
                  <p className="text-sm text-white">{profile.displayName} @{profile.username}</p>
                  <p className="text-xs text-white/35">
                    {profile.claimStatus} · {profile.isDisabled ? "disabled" : "live"} · {profile.isSeed ? "seed" : "user"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" className="text-white/50" onClick={() => patchProfile(profile.id, { is_featured: !profile.isFeatured })}>
                    {profile.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button type="button" className="text-white/50" onClick={() => patchProfile(profile.id, { editor_pick: !profile.editorPick })}>
                    {profile.editorPick ? "Remove pick" : "Editor pick"}
                  </button>
                  <button type="button" className="text-white/50" onClick={() => patchProfile(profile.id, { is_disabled: !profile.isDisabled })}>
                    {profile.isDisabled ? "Enable" : "Disable"}
                  </button>
                  {profile.userId ? (
                    <button type="button" className="text-white/50" onClick={() => patchProfile(profile.id, { claim_status: profile.claimStatus === "claimed" ? "unclaimed" : "claimed" })}>
                      Mark {profile.claimStatus === "claimed" ? "unclaimed" : "claimed"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "categories" ? (
        <ul className="mt-8 space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="rounded-2xl border border-white/[0.07] p-3 text-sm text-white">
              {cat.name} · {cat.slug} · {cat.profileCount ?? 0} profiles
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "projects" ? (
        <ul className="mt-8 space-y-2">
          {projects.slice(0, 80).map((project) => (
            <li key={project.id} className="rounded-2xl border border-white/[0.07] p-3 text-sm text-white">
              {project.name}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "claims" ? (
        <ul className="mt-8 space-y-2">
          {claims.map((claim) => (
            <li key={claim.id} className="flex items-center justify-between rounded-2xl border border-white/[0.07] p-3 text-sm text-white">
              <span>
                {claim.status} · {claim.proof_note}
              </span>
              {claim.status === "pending" ? (
                <button
                  type="button"
                  className="text-white/50"
                  onClick={() =>
                    fetch("/api/discovery/admin", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ entity: "claim", id: claim.id, patch: { status: "approved" } }),
                    }).then(() => router.refresh())
                  }
                >
                  Approve
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "reports" ? (
        <ul className="mt-8 space-y-2">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl border border-white/[0.07] p-3 text-sm text-white">
              {report.status} · {report.reason}
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "pro" ? (
        <ul className="mt-8 space-y-2">
          {subscriptions.map((sub) => (
            <li key={sub.user_id} className="rounded-2xl border border-white/[0.07] p-3 text-sm text-white">
              {sub.plan} · {sub.status}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
