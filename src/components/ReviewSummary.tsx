import { JsonLd } from "./StructuredData";
import { SITE } from "@/config/site";

/**
 * Note agrégée, présentée façon Trustpilot.
 *
 * Ne rend rien tant qu'aucune note réelle n'est configurée : pas d'étoiles,
 * pas de nombre d'avis, pas de donnée structurée. Une note inventée sur un
 * site commercial est une pratique commerciale trompeuse, et Google retire
 * les extraits enrichis des sites dont les avis ne sont pas authentiques.
 *
 * Dès que `reviewSummary.rating` est renseigné depuis une source réelle, le
 * bloc apparaît et l'AggregateRating part avec — les deux d'un coup, jamais
 * l'un sans l'autre.
 */
export function ReviewSummary() {
  const { rating, count, source, url } = SITE.reviewSummary;
  if (rating === null || count <= 0) return null;

  const rounded = Math.round(rating * 2) / 2;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AggregateRating",
          itemReviewed: { "@type": "LocalBusiness", name: SITE.name, url: SITE.url },
          ratingValue: rating,
          reviewCount: count,
          bestRating: 5,
          worstRating: 1,
        }}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} index={i} fill={rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0} />
          ))}
        </div>
        <p className="text-[15px] font-medium text-label-strong">
          <span className="font-display font-bold text-white">{rating.toLocaleString("fr-FR")}</span>
          <span className="text-label"> / 5</span>
          <span className="text-label"> · {count} avis</span>
          {source && <span className="text-label"> · {source}</span>}
        </p>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-accent hover:underline">
            Voir les avis
          </a>
        )}
      </div>
    </>
  );
}

/** Étoile pleine, à moitié pleine ou vide. */
function Star({ fill, index }: { fill: 0 | 0.5 | 1; index: number }) {
  // Identifiant déterministe : un Math.random() ici ferait diverger le rendu
  // serveur et le rendu client.
  const id = `etoile-moitie-${index}`;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      {fill === 0.5 && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="#0A84FF" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.18)" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.95L12 2.6z"
        fill={fill === 1 ? "#0A84FF" : fill === 0.5 ? `url(#${id})` : "rgba(255,255,255,0.18)"}
      />
    </svg>
  );
}
