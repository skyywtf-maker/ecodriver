import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Politique de confidentialité · Eco Driver" };

export default function Page() {
  return (
    <LegalPage title="Confidentialité">
      <h2>Données collectées</h2>
      <p>Lors d&apos;une réservation, nous collectons : nom, prénom, numéro de téléphone, adresse email, adresses de départ et d&apos;arrivée du trajet, date et heure de prise en charge, nombre de passagers et de bagages, ainsi que la note éventuelle laissée au chauffeur.</p>
      <h2>Utilisation</h2>
      <p>Ces données servent uniquement à organiser et effectuer la course, à vous contacter à son sujet (confirmation, rappel, remboursement) et à respecter nos obligations comptables. Elles ne sont ni revendues ni utilisées à des fins publicitaires.</p>
      <h2>Paiement</h2>
      <p>Le paiement est traité par Stripe. Vos données bancaires ne transitent pas par nos serveurs et ne sont pas conservées par nous.</p>
      <h2>Destinataires</h2>
      <p>Le chauffeur, et nos sous-traitants techniques : Stripe (paiement), Mapbox (calcul d&apos;itinéraire), Resend (emails), Vercel (hébergement), [fournisseur de base de données].</p>
      <h2>Durée de conservation</h2>
      <p>[À définir, par exemple 3 ans après la course, 10 ans pour les pièces comptables.]</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation et d&apos;opposition. Écrivez à [email]. Vous pouvez également saisir la CNIL (cnil.fr).</p>
    </LegalPage>
  );
}
