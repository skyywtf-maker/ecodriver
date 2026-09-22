import { SITE } from "@/config/site";
import { ReviewSummary } from "./ReviewSummary";
import { Slider } from "./Slider";

/**
 * Preuves de confiance de la marque, et avis des passagers.
 *
 * Remplace la fiche individuelle du chauffeur : ce sont des chiffres
 * vérifiables sur le service, pas la présentation d'une personne.
 *
 * Chiffres et avis tiennent dans une seule section : séparés, ils faisaient
 * deux écrans de téléphone pour dire la même chose. Les chiffres passent en
 * grille 2 × 2, les motifs de satisfaction en slider.
 */
export function TrustSection() {
  const cards = [
    ...SITE.reviewHighlights.map((h) => ({ kind: "highlight" as const, title: h.title, text: h.text })),
    ...SITE.reviews.map((r) => ({ kind: "review" as const, title: r.author, text: r.text, route: r.route })),
  ];

  return (
    <section id="avis" className="scroll-mt-28 pt-16 md:pt-[104px]">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Confiance</p>
        <h2 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.035em] md:text-5xl">
          Pourquoi <span className="serif-accent">nous choisir.</span>
        </h2>
        <div className="mt-1">
          <ReviewSummary />
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 overflow-hidden rounded-3xl border border-white/[0.08] lg:grid-cols-4">
        {SITE.trust.map((t, i) => (
          <div
            key={t.k}
            className={`flex flex-col gap-2 bg-white/[0.03] p-4 md:p-6 ${i % 2 === 0 ? "border-r" : ""} ${
              i < 2 ? "border-b lg:border-b-0" : ""
            } ${i === 1 ? "lg:border-r" : ""} border-white/[0.08]`}
          >
            <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-label">{t.k}</dt>
            <dd className="flex flex-col gap-1">
              <span className="font-display text-[24px] font-bold leading-none tracking-[-0.03em] md:text-[30px]">{t.v}</span>
              <span className="text-[12px] leading-snug text-label md:text-[13px]">{t.d}</span>
            </dd>
          </div>
        ))}
      </dl>

      {cards.length > 0 && (
        <Slider label="Ce que disent les passagers" className="mt-3" itemClassName="w-[72%] sm:w-[40%] lg:w-[24%]">
          {cards.map((c) => (
            <figure key={c.title + c.text} className="tile flex h-full flex-col justify-between gap-5 rounded-3xl p-5">
              {c.kind === "review" ? (
                <blockquote className="font-serif text-[20px] italic leading-snug">« {c.text} »</blockquote>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-[16px] font-bold tracking-[-0.02em]">{c.title}</h3>
                  <p className="text-[13px] leading-snug text-label">{c.text}</p>
                </div>
              )}
              <figcaption className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
                {c.kind === "review" ? `${c.title} · ${c.route}` : "Motif cité · Uber"}
              </figcaption>
            </figure>
          ))}
        </Slider>
      )}
    </section>
  );
}
