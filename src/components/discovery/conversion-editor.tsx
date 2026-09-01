"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import {
  MAX_ACTIVE_PROFILE_BLOCKS,
  PROFILE_BLOCK_DEFAULTS,
  PROFILE_BLOCK_TYPE_LABELS,
  PROFILE_BLOCK_TYPES,
  PROFILE_CTA_PLACEHOLDERS,
  PROFILE_CTA_TYPE_LABELS,
  PROFILE_CTA_TYPES,
  isProfileBlockType,
  isProfileCtaType,
  type ProfileBlockType,
  type ProfileCtaType,
} from "@/src/lib/discovery/conversion";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import type { Profile, ProfileBlock } from "@/src/lib/discovery/types";

const selectClass =
  "sz-focus h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-3 text-sm text-white outline-none";

export function ConversionEditor({
  profile,
  blocks,
  isPro,
}: {
  profile: Profile;
  blocks: ProfileBlock[];
  isPro: boolean;
}) {
  return (
    <div className="space-y-10">
      <p className="text-sm text-white/40">
        Turn profile visits into clicks. Links open your own tools — Calendly, Beehiiv, Discord, your site.
      </p>
      {!isPro ? <ProLock /> : null}
      <PrimaryCtaForm profile={profile} isPro={isPro} />
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">
          Premium blocks
          {!isPro ? (
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
              Pro
            </span>
          ) : null}
        </p>
        <p className="mb-4 text-sm text-white/40">Up to {MAX_ACTIVE_PROFILE_BLOCKS} active blocks on your public page.</p>
        <BlockList blocks={blocks} isPro={isPro} />
      </div>
    </div>
  );
}

function ProLock() {
  return (
    <div className="rounded-[1.25rem] bg-white/[0.035] px-4 py-3.5 ring-1 ring-white/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white">
            Custom CTA{" "}
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-white/55">
              Pro
            </span>
          </p>
          <p className="mt-1 text-sm text-white/40">Premium blocks · Pro. Convert visitors without changing your Free profile.</p>
        </div>
        <Link href={DISCOVERY_ROUTES.settings}>
          <Button type="button" size="sm" className="sz-press">
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    </div>
  );
}

function PrimaryCtaForm({ profile, isPro }: { profile: Profile; isPro: boolean }) {
  const router = useRouter();
  const [type, setType] = useState<ProfileCtaType>(isProfileCtaType(profile.ctaType) ? profile.ctaType : "custom");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPro) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ctaType: type,
        ctaLabel: String(form.get("ctaLabel") ?? ""),
        ctaUrl: String(form.get("ctaUrl") ?? ""),
      }),
    });
    setPending(false);
    setMessage(response.ok ? "Saved." : "Could not save CTA.");
    if (response.ok) router.refresh();
  }

  async function clear() {
    setPending(true);
    await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ctaLabel: "", ctaUrl: "", ctaType: "custom" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <form className="space-y-3" onSubmit={save}>
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
        Primary CTA
        {!isPro ? (
          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
            Pro
          </span>
        ) : null}
      </p>
      <label className="block">
        <span className="sz-label mb-2 block">Type</span>
        <select
          value={type}
          disabled={!isPro}
          onChange={(event) => setType(event.target.value as ProfileCtaType)}
          className={selectClass}
        >
          {PROFILE_CTA_TYPES.map((key) => (
            <option key={key} value={key}>
              {PROFILE_CTA_TYPE_LABELS[key]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="sz-label mb-2 block">Label</span>
        <Input name="ctaLabel" defaultValue={profile.ctaLabel ?? ""} placeholder={PROFILE_CTA_PLACEHOLDERS[type]} disabled={!isPro} />
      </label>
      <label className="block">
        <span className="sz-label mb-2 block">URL</span>
        <Input name="ctaUrl" defaultValue={profile.ctaUrl ?? ""} placeholder="https://" disabled={!isPro} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="sz-press" disabled={!isPro || pending}>
          {pending ? "Saving…" : "Save CTA"}
        </Button>
        {profile.ctaUrl ? (
          <Button type="button" variant="ghost" disabled={pending} onClick={() => void clear()}>
            Remove
          </Button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-white/45">{message}</p> : null}
    </form>
  );
}

function BlockList({ blocks, isPro }: { blocks: ProfileBlock[]; isPro: boolean }) {
  const router = useRouter();
  const [adding, setAdding] = useState<ProfileBlockType | null>(null);
  const [editing, setEditing] = useState<ProfileBlock | null>(null);
  const activeCount = blocks.filter((block) => block.isActive).length;

  async function remove(id: string) {
    await fetch("/api/discovery/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function toggle(block: ProfileBlock) {
    await fetch("/api/discovery/blocks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: block.id, isActive: !block.isActive }),
    });
    router.refresh();
  }

  async function move(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((item) => item.id === id);
    const next = index + direction;
    if (next < 0 || next >= blocks.length) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(next, 0, moved);
    await fetch("/api/discovery/blocks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered.map((item, i) => ({ id: item.id, sortIndex: i })) }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={block.id} className="rounded-[1.25rem] bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.06]">
        <div className="flex flex-col gap-2">
          <div className="min-w-0">
              <p className="text-sm text-white">{block.title || PROFILE_BLOCK_TYPE_LABELS[block.blockType as ProfileBlockType] || block.blockType}</p>
              <p className="mt-1 text-xs text-white/40">
                {PROFILE_BLOCK_TYPE_LABELS[block.blockType as ProfileBlockType] ?? block.blockType}
                {block.isActive ? " · Active" : " · Off"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1 text-xs text-white/40">
              <button type="button" className="min-h-11 px-2" onClick={() => setEditing(block)} disabled={!isPro}>
                Edit
              </button>
              {index > 0 ? (
                <button type="button" className="min-h-11 px-2" onClick={() => void move(block.id, -1)} disabled={!isPro}>
                  Up
                </button>
              ) : null}
              {index < blocks.length - 1 ? (
                <button type="button" className="min-h-11 px-2" onClick={() => void move(block.id, 1)} disabled={!isPro}>
                  Down
                </button>
              ) : null}
              <button type="button" className="min-h-11 px-2" onClick={() => void toggle(block)} disabled={!isPro && !block.isActive}>
                {block.isActive ? "Disable" : "Enable"}
              </button>
              <button type="button" className="min-h-11 px-2" onClick={() => void remove(block.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      {adding ? (
        <BlockForm
          type={adding}
          onClose={() => setAdding(null)}
          onSaved={() => {
            setAdding(null);
            router.refresh();
          }}
        />
      ) : editing ? (
        <BlockForm
          type={isProfileBlockType(editing.blockType) ? editing.blockType : "custom"}
          block={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {PROFILE_BLOCK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={!isPro}
              onClick={() => setAdding(type)}
              className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-white/65 ring-1 ring-white/[0.06] hover:text-white"
            >
              + {PROFILE_BLOCK_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-white/35">
        {activeCount}/{MAX_ACTIVE_PROFILE_BLOCKS} active
      </p>
    </div>
  );
}

function BlockForm({
  type,
  block,
  onClose,
  onSaved,
}: {
  type: ProfileBlockType;
  block?: ProfileBlock;
  onClose: () => void;
  onSaved: () => void;
}) {
  const defaults = PROFILE_BLOCK_DEFAULTS[type];
  const [pending, setPending] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const payload = {
      blockType: type,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      ctaLabel: String(form.get("ctaLabel") ?? ""),
      url: String(form.get("url") ?? ""),
      isActive: form.get("isActive") === "on",
    };
    const response = await fetch("/api/discovery/blocks", {
      method: block ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block ? { id: block.id, ...payload } : payload),
    });
    setPending(false);
    if (response.ok) onSaved();
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-[1.25rem] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.08]">
      <p className="text-sm text-white">{block ? "Edit block" : `Add ${PROFILE_BLOCK_TYPE_LABELS[type]}`}</p>
      <Input name="title" defaultValue={block?.title ?? defaults.title} placeholder="Title" />
      <Input name="description" defaultValue={block?.description ?? defaults.description} placeholder="Short text" />
      <Input name="ctaLabel" defaultValue={block?.ctaLabel ?? defaults.ctaLabel} placeholder="Button label" />
      <Input name="url" defaultValue={block?.url ?? ""} placeholder="https://" required />
      <label className="flex items-center gap-2 text-sm text-white/60">
        <input type="checkbox" name="isActive" defaultChecked={block?.isActive ?? true} className="h-4 w-4" />
        Active on profile
      </label>
      <div className="flex gap-2">
        <Button type="submit" className="sz-press" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
