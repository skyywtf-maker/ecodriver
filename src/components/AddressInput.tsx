"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { DraftPoint } from "@/lib/draft";

type Place = DraftPoint & { inGrandEst: boolean };

type Props = {
  label: string;
  placeholder: string;
  marker: "start" | "end";
  value: DraftPoint | null;
  onChange: (p: (DraftPoint & { inGrandEst: boolean }) | null) => void;
  className?: string;
};

export function AddressInput({ label, placeholder, marker, value, onChange, className = "" }: Props) {
  const [text, setText] = useState(value?.label ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const skipFetch = useRef(false);

  useEffect(() => {
    setText(value?.label ?? "");
  }, [value?.label]);

  useEffect(() => {
    if (skipFetch.current) {
      skipFetch.current = false;
      return;
    }
    const q = text.trim();
    if (q.length < 3 || q === value?.label) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = (await r.json()) as { places: Place[] };
        setResults(data.places);
        setActive(0);
        setOpen(true);
      } catch {}
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [text, value?.label]);

  function pick(p: Place) {
    skipFetch.current = true;
    setText(p.label);
    setOpen(false);
    setResults([]);
    onChange(p);
  }

  return (
    <div className={`relative flex h-16 items-center gap-3.5 px-[18px] ${className}`}>
      <span
        aria-hidden
        className={
          marker === "start"
            ? "h-2.5 w-2.5 shrink-0 rounded-full border-[2.5px] border-white"
            : "h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
        }
      />
      <label className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="field-label">{label}</span>
        <input
          type="text"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className="field-input truncate"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!open || !results.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              pick(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </label>
      {open && results.length > 0 && (
        <ul id={listId} role="listbox" className="glass absolute left-2 right-2 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl py-1.5 shadow-2xl">
          {results.map((p, i) => (
            <li
              key={`${p.lng},${p.lat},${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(p);
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-4 py-2.5 text-sm ${i === active ? "bg-white/10" : ""}`}
            >
              <span className="block truncate font-medium">{p.label}</span>
              {!p.inGrandEst && <span className="text-xs text-[#FF9F0A]">Hors Grand Est</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
