"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeroBooking } from "./HeroBooking";
import { TripSummary } from "./TripSummary";
import { ContactForm, type Contact } from "./ContactForm";
import { PaymentStep } from "./PaymentStep";
import { RouteMap } from "@/components/RouteMap";
import { Logo } from "@/components/Logo";
import { SITE } from "@/config/site";
import { loadDraft, type TripDraft } from "@/lib/draft";

const CONTACT_KEY = "ecodriver:contact";

export function BookingFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<TripDraft | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setDraft(d);
      setStep(2);
    }
    try {
      const c = sessionStorage.getItem(CONTACT_KEY);
      if (c) setContact(JSON.parse(c));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!ready) return <div className="h-[100svh]" />;

  if (step === 1 || !draft) {
    return (
      <>
        <StepNav step={1} />
        <HeroBooking
          showHeadline={false}
          onContinue={(d) => {
            setDraft(d);
            setStep(2);
          }}
        />
      </>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      <div className="fixed inset-0">
        <RouteMap from={draft.from} to={draft.to} geometry={draft.quote.geometry} padding={{ top: 140, bottom: 80, left: 80, right: 80 }} />
        <div className="absolute inset-0 bg-ink/35" />
      </div>
      <StepNav step={step} onBack={() => setStep(1)} />

      <div className="relative z-10 mx-auto grid max-w-[1312px] gap-4 px-2 pb-6 pt-24 md:px-16 md:pt-[120px] lg:grid-cols-[1fr_440px]">
        <div className="glass rounded-5xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-10">
          {step === 2 ? (
            <ContactForm
              initial={contact}
              onBack={() => setStep(1)}
              onSubmit={(c) => {
                setContact(c);
                try {
                  sessionStorage.setItem(CONTACT_KEY, JSON.stringify(c));
                } catch {}
                setStep(3);
              }}
            />
          ) : (
            contact && <PaymentStep draft={draft} contact={contact} onBack={() => setStep(2)} />
          )}
        </div>
        <aside className="glass rounded-5xl p-6 md:p-8">
          <TripSummary draft={draft} detailed={step === 3} />
        </aside>
      </div>
    </main>
  );
}

function StepNav({ step, onBack }: { step: 1 | 2 | 3; onBack?: () => void }) {
  const steps = ["Trajet", "Coordonnées", "Paiement"];
  return (
    <nav className="glass fixed inset-x-4 top-4 z-30 flex h-14 items-center justify-between rounded-full pl-5 pr-2 md:inset-x-16 md:top-6 md:h-16 md:pl-7">
      <Logo />
      <ol className="flex gap-1 rounded-full bg-white/[0.06] p-1">
        {steps.map((s, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const current = n === step;
          const done = n < step;
          return (
            <li key={s}>
              {done && n === 1 && onBack ? (
                <button type="button" onClick={onBack} className="flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-label hover:text-white md:px-4">
                  ✓ <span className="ml-1.5 hidden sm:inline">{s}</span>
                </button>
              ) : (
                <span
                  aria-current={current ? "step" : undefined}
                  className={`flex h-9 items-center rounded-full px-3 text-[13px] md:px-4 ${
                    current ? "bg-white font-display font-semibold text-ink" : "font-medium text-label"
                  }`}
                >
                  {done ? "✓" : n}
                  <span className={`ml-1.5 ${current ? "" : "hidden sm:inline"}`}>{s}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <Link href={SITE.phoneHref} className="hidden px-4 text-sm font-medium text-label-strong hover:text-white md:block">
        {SITE.phoneDisplay}
      </Link>
    </nav>
  );
}
