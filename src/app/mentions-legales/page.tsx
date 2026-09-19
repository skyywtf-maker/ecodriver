import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Mentions légales · Eco Driver" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur du site</h2>
      <p>[Nom et prénom du chauffeur ou raison sociale], [forme juridique], SIRET [à compléter], [adresse]. Inscription au registre des VTC : [numéro EVTC à compléter].</p>
      <p>Contact : [email] · [téléphone].</p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
      <h2>Conception</h2>
      <p>AchMedia.</p>
    </LegalPage>
  );
}
