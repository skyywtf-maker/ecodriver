/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `next dev` et `next build` écrivent tous les deux dans .next : lancer une
  // vérification de build pendant que le serveur de développement tourne lui
  // efface les fichiers sous les pieds, et la page s'affiche sans CSS.
  // En local, on vérifie donc avec NEXT_DIST_DIR=.next-verify. La variable
  // n'est pas définie sur Vercel, qui retrouve bien .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
export default nextConfig;
