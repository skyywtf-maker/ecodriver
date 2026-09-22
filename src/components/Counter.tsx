"use client";

type Props = { label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void };

export function Counter({ label, unit, value, min, max, onChange }: Props) {
  return (
    <div className="field flex h-[54px] items-center justify-between pl-4 pr-1.5 md:h-[60px] md:pl-[18px]">
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
          className="h-10 w-10 rounded-xl bg-white/[0.08] text-lg disabled:opacity-30 md:h-11 md:w-11"
        >
          −
        </button>
        <button
          type="button"
          aria-label={`Ajouter un ${unit}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 rounded-xl bg-white/[0.08] text-lg disabled:opacity-30 md:h-11 md:w-11"
        >
          +
        </button>
      </div>
    </div>
  );
}
