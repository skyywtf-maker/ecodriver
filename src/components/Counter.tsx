"use client";

type Props = { label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void };

export function Counter({ label, unit, value, min, max, onChange }: Props) {
  return (
    <div className="field flex h-[60px] items-center justify-between pl-[18px] pr-1.5">
      <div className="flex flex-col gap-0.5">
        <span className="field-label">{label}</span>
        <span className="text-[15px] font-semibold" aria-live="polite">{value}</span>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label={`Retirer un ${unit}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="h-11 w-11 rounded-xl bg-white/[0.08] text-lg disabled:opacity-30"
        >
          −
        </button>
        <button
          type="button"
          aria-label={`Ajouter un ${unit}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="h-11 w-11 rounded-xl bg-white/[0.08] text-lg disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
