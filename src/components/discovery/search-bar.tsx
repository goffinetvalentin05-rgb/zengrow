"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { cn } from "@/src/lib/utils";

export function DiscoverySearchBar({
  defaultValue = "",
  className,
  autoFocus = false,
}: {
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search people, projects, niches"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="sz-focus h-12 w-full rounded-full border border-white/[0.08] bg-white/[0.05] pl-11 pr-[3.75rem] text-sm text-white outline-none placeholder:text-white/30 transition-colors duration-150 hover:border-white/14 focus:border-white/22"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 inline-flex h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full px-3 text-sm text-white/70"
        aria-label="Search"
      >
        Go
      </button>
    </form>
  );
}
