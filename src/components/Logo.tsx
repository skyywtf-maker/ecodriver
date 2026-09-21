import Link from "next/link";
import Image from "next/image";
import { LOGO } from "@/config/site";

/**
 * Marque du site, chargée depuis un fichier des assets.
 *
 * Le fichier est la source de vérité : le remplacer dans public/ suffit, sans
 * toucher au code. Tant qu'il n'est pas déposé (`LOGO.file` à null), le
 * logotype texte d'origine prend le relais, pour qu'aucun en-tête ne se
 * retrouve vide.
 *
 * `variant` choisit la déclinaison selon le fond : `light` pour les surfaces
 * sombres du site, `dark` pour d'éventuelles sections claires.
 */
export function Logo({
  className = "text-xl",
  variant = "light",
  priority = false,
}: {
  className?: string;
  variant?: "light" | "dark";
  priority?: boolean;
}) {
  const file = variant === "dark" ? (LOGO.fileDark ?? LOGO.file) : LOGO.file;

  return (
    <Link href="/" aria-label={`${LOGO.alt} — accueil`} className={`inline-flex items-center ${className}`}>
      {file ? (
        <Image
          src={file}
          alt={LOGO.alt}
          width={LOGO.width}
          height={LOGO.height}
          priority={priority}
          // La hauteur suit la taille de texte du conteneur : un seul réglage
          // pour l'en-tête, le pied de page et les écrans de connexion.
          className="h-[1.6em] w-auto"
        />
      ) : (
        <span className="font-display font-bold tracking-[-0.02em]">
          Eco <span className="serif-accent">Driver</span>
        </span>
      )}
    </Link>
  );
}
