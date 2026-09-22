"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { DraftPoint } from "@/lib/draft";

type Place = DraftPoint & { inGrandEst: boolean; hint?: string };

type Props = {
  label: string;
  placeholder: string;
  marker: "start" | "end";
  value: DraftPoint | null;
  onChange: (p: (DraftPoint & { inGrandEst: boolean }) | null) => void;
  className?: string;
  /** Appelé à la prise de focus : la feuille réduite se déplie pour laisser la place à la liste. */
  onFocus?: () => void;
};

export function AddressInput({ label, placeholder, marker, value, onChange, className = "", onFocus }: Props) {
  const [text, setText] = useState(value?.label ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  /** Recherche terminée sans aucun lieu dans la zone : on le dit plutôt que rien. */
  const [empty, setEmpty] = useState(false);
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
    if (q.length < 2 || q === value?.label) {
      setResults([]);
      setEmpty(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = (await r.json()) as { places: Place[] };
        setResults(data.places);
        setEmpty(data.places.length === 0 && q.length >= 3);
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
          onFocus={() => {
            onFocus?.();
            if (results.length) setOpen(true);
          }}
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
      {/* Effacer d'un geste : un lieu touché par erreur sur la carte, ou une
          adresse à reprendre, sans devoir tout supprimer au clavier. */}
      {text && (
        <button
          type="button"
          onClick={() => {
            skipFetch.current = true;
            setText("");
            setResults([]);
            setEmpty(false);
            setOpen(false);
            onChange(null);
          }}
          aria-label={`Effacer : ${label}`}
          className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
      {open && empty && (
        <p className="absolute left-2 right-2 top-[calc(100%+6px)] z-40 rounded-2xl border border-white/[0.12] bg-[#17191E] px-4 py-3 text-[13px] text-label shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          Aucun lieu trouvé dans la zone desservie. Essayez une adresse avec la ville.
        </p>
      )}
      {open && results.length > 0 && (
        // Fond opaque et non « glass » : la liste est posée dans la carte de
        // réservation, elle-même en verre dépoli. Un flou d'arrière-plan
        // imbriqué ne voit que son parent, et le texte de la page reste net
        // dessous — liste illisible.
        <ul
          id={listId}
          role="listbox"
          className="absolute left-2 right-2 top-[calc(100%+6px)] z-40 max-h-[300px] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/[0.12] bg-[#17191E] py-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
        >
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
              className={`flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm ${i === active ? "bg-white/10" : ""}`}
            >
              <PinIcon />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.label}</span>
                {p.hint && <span className="block truncate text-xs text-label">{p.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-label"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
