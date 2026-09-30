"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/button";
import EmptyState from "@/src/components/ui/empty-state";
import { actionCreateItem, actionDeleteItem, actionUpdateItem } from "@/src/lib/learn/actions";
import {
  KIND_LABELS,
  SOURCE_KINDS,
  SOURCE_LABELS,
  type ItemKind,
  type ItemStatus,
  type LearningCategory,
  type LearningItem,
  type SourceKind,
} from "@/src/lib/learn/types";
import Modal, { fieldClass, labelClass } from "@/src/components/learn/modal";

const KINDS: Array<ItemKind | "all"> = ["all", "vocabulary", "expression", "correction", "grammar"];

function promptFor(item: LearningItem) {
  if (item.kind === "correction") return item.incorrectForm || item.title;
  return item.title;
}

function answerFor(item: LearningItem) {
  if (item.kind === "correction") return [item.correctForm, item.body].filter(Boolean).join(" — ");
  if (item.kind === "grammar") return [item.body, item.example].filter(Boolean).join("\n");
  return [item.translation, item.body].filter(Boolean).join(" — ");
}

export default function LibraryView({
  items,
  categories,
  logsByItem,
}: {
  items: LearningItem[];
  categories: LearningCategory[];
  logsByItem: Record<string, { rating: string; reviewed_at: string }[]>;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState<"all" | ItemStatus>("all");
  const [source, setSource] = useState<"all" | SourceKind>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<ItemKind | null>(null);
  const [selected, setSelected] = useState<LearningItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (categoryId !== "all" && item.categoryId !== categoryId) return false;
      if (status !== "all" && item.status !== status) return false;
      if (source !== "all" && item.sourceKind !== source) return false;
      if (!q) return true;
      return [item.title, item.translation, item.body, item.example, item.incorrectForm, item.correctForm]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q));
    });
  }, [items, kind, categoryId, status, source, query]);

  async function onCreate(form: FormData) {
    setError(null);
    if (!adding) return;
    const result = await actionCreateItem({
      kind: adding,
      title: String(form.get("title") || form.get("incorrectForm") || ""),
      translation: String(form.get("translation") || ""),
      body: String(form.get("body") || ""),
      example: String(form.get("example") || ""),
      incorrectForm: String(form.get("incorrectForm") || ""),
      correctForm: String(form.get("correctForm") || ""),
      categoryId: String(form.get("categoryId") || "") || null,
      sourceKind: (String(form.get("sourceKind") || "other") || "other") as SourceKind,
      sourceLabel: String(form.get("sourceLabel") || ""),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAdding(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-white/50">Everything you decide to keep.</p>
        </div>
        <Button type="button" onClick={() => setAdding("vocabulary")}>
          Add
        </Button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {KINDS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setKind(value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${kind === value ? "bg-white text-zinc-950" : "bg-white/5 text-white/70"}`}
          >
            {value === "all" ? "All" : KIND_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <input className={fieldClass} placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className={fieldClass} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="mastered">Mastered</option>
        </select>
        <select className={fieldClass} value={source} onChange={(event) => setSource(event.target.value as typeof source)}>
          <option value="all">All sources</option>
          {SOURCE_KINDS.map((value) => (
            <option key={value} value={value}>
              {SOURCE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your English starts here."
            description="Add a word, an expression, a correction or a grammar rule from real life."
            action={<Button onClick={() => setAdding("vocabulary")}>Add something</Button>}
          />
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-sm text-white/50">Nothing matches these filters.</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {visible.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-medium">{promptFor(item)}</p>
                  <span className="shrink-0 text-xs uppercase tracking-wide text-white/40">{item.status}</span>
                </div>
                {answerFor(item) ? <p className="mt-1 line-clamp-2 text-sm text-white/55">{answerFor(item)}</p> : null}
                <p className="mt-3 text-xs text-white/40">
                  {KIND_LABELS[item.kind]}
                  {item.categoryName ? ` · ${item.categoryName}` : ""}
                  {item.sourceKind ? ` · ${SOURCE_LABELS[item.sourceKind]}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <Modal title={`Add ${KIND_LABELS[adding].toLowerCase()}`} onClose={() => setAdding(null)}>
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(KIND_LABELS) as ItemKind[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAdding(value)}
                className={`rounded-full px-3 py-1 text-xs ${adding === value ? "bg-white text-zinc-950" : "bg-white/10 text-white/70"}`}
              >
                {KIND_LABELS[value]}
              </button>
            ))}
          </div>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void onCreate(new FormData(event.currentTarget));
            }}
          >
            <ItemFields kind={adding} categories={categories} />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button type="submit">Save</Button>
          </form>
        </Modal>
      ) : null}

      {selected ? (
        <ItemDrawer
          item={selected}
          categories={categories}
          logs={logsByItem[selected.id] ?? []}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function ItemFields({ kind, categories, item }: { kind: ItemKind; categories: LearningCategory[]; item?: LearningItem }) {
  return (
    <>
      {kind === "correction" ? (
        <>
          <label className={labelClass}>
            What I said
            <input name="incorrectForm" required defaultValue={item?.incorrectForm ?? ""} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Correct version
            <input name="correctForm" required defaultValue={item?.correctForm ?? ""} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Explanation
            <textarea name="body" defaultValue={item?.body ?? ""} className={fieldClass} rows={3} />
          </label>
          <input type="hidden" name="title" value={item?.title ?? ""} />
        </>
      ) : (
        <>
          <label className={labelClass}>
            {kind === "grammar" ? "Rule" : kind === "expression" ? "Expression" : "Word"}
            <input name="title" required defaultValue={item?.title ?? ""} className={fieldClass} />
          </label>
          {kind !== "grammar" ? (
            <label className={labelClass}>
              Translation
              <input name="translation" defaultValue={item?.translation ?? ""} className={fieldClass} />
            </label>
          ) : null}
          <label className={labelClass}>
            {kind === "grammar" ? "Explanation" : "Meaning / note"}
            <textarea name="body" defaultValue={item?.body ?? ""} className={fieldClass} rows={3} />
          </label>
          <label className={labelClass}>
            Example
            <input name="example" defaultValue={item?.example ?? ""} className={fieldClass} />
          </label>
        </>
      )}
      <label className={labelClass}>
        Category
        <select name="categoryId" defaultValue={item?.categoryId ?? ""} className={fieldClass}>
          <option value="">None</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Source
        <select name="sourceKind" defaultValue={item?.sourceKind ?? "other"} className={fieldClass}>
          {SOURCE_KINDS.map((value) => (
            <option key={value} value={value}>
              {SOURCE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Source detail
        <input name="sourceLabel" defaultValue={item?.sourceLabel ?? ""} placeholder="Optional" className={fieldClass} />
      </label>
    </>
  );
}

function ItemDrawer({
  item,
  categories,
  logs,
  onClose,
  onChanged,
}: {
  item: LearningItem;
  categories: LearningCategory[];
  logs: { rating: string; reviewed_at: string }[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function save(form: FormData) {
    const result = await actionUpdateItem(item.id, {
      title: String(form.get("title") || form.get("incorrectForm") || item.title),
      translation: String(form.get("translation") || ""),
      body: String(form.get("body") || ""),
      example: String(form.get("example") || ""),
      incorrectForm: String(form.get("incorrectForm") || ""),
      correctForm: String(form.get("correctForm") || ""),
      categoryId: String(form.get("categoryId") || "") || null,
      sourceKind: String(form.get("sourceKind") || "other") as SourceKind,
      sourceLabel: String(form.get("sourceLabel") || ""),
    });
    if (!result.ok) setError(result.error);
    else onChanged();
  }

  async function setStatus(status: ItemStatus) {
    const result = await actionUpdateItem(item.id, { status });
    if (!result.ok) setError(result.error);
    else onChanged();
  }

  async function remove() {
    const result = await actionDeleteItem(item.id);
    if (!result.ok) setError(result.error);
    else onChanged();
  }

  return (
    <Modal title={promptFor(item)} onClose={onClose}>
      {editing ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save(new FormData(event.currentTarget));
          }}
        >
          <ItemFields kind={item.kind} categories={categories} item={item} />
          <Button type="submit">Save changes</Button>
        </form>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-white/70">{answerFor(item) || "No extra note yet."}</p>
          {item.example && item.kind !== "grammar" ? <p className="text-white/50">Example: {item.example}</p> : null}
          <p className="text-xs text-white/40">
            Added {new Date(item.createdAt).toLocaleDateString()} · Next review{" "}
            {item.dueAt ? new Date(item.dueAt).toLocaleString() : "not scheduled"}
          </p>
          {logs.length > 0 ? (
            <ul className="space-y-1 text-xs text-white/50">
              {logs.map((log) => (
                <li key={log.reviewed_at}>
                  {log.rating} · {new Date(log.reviewed_at).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-white/40">No reviews yet.</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
            {item.status !== "mastered" ? (
              <Button type="button" variant="secondary" onClick={() => void setStatus("mastered")}>
                Mark mastered
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => void setStatus("learning")}>
                Back to learning
              </Button>
            )}
            <Button type="button" variant="danger" onClick={() => void remove()}>
              Delete
            </Button>
          </div>
        </div>
      )}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </Modal>
  );
}
