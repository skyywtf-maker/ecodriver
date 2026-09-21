import { SITE } from "@/config/site";

/**
 * Preuves de confiance de la marque.
 *
 * Remplace la fiche individuelle du chauffeur : ce sont des chiffres
 * vérifiables sur le service, pas la présentation d'une personne.
 */
export function TrustSection() {
  return (
    <section id="confiance" className="scroll-mt-28 pt-24 md:pt-[120px]">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-4xl font-bold tracking-[-0.035em] md:text-5xl">
          Pourquoi <span className="serif-accent">nous choisir.</span>
        </h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-label">
          Des chiffres, pas des promesses. La note et le nombre de courses viennent des évaluations laissées par les
          passagers.
        </p>
      </div>

      <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SITE.trust.map((t) => (
          <div key={t.k} className="tile flex flex-col gap-2 rounded-4xl p-6">
            <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-label">{t.k}</dt>
            <dd className="flex flex-col gap-1.5">
              <span className="font-display text-[30px] font-bold leading-none tracking-[-0.03em]">{t.v}</span>
              <span className="text-[13px] leading-snug text-label">{t.d}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
