import { LegalPage } from "@/components/LegalPage";
import { BOOKING_RULES } from "@/config/pricing";

export const metadata = { title: "Conditions générales de vente · Eco Driver" };

// TODO: texte définitif à faire valider par le client (idéalement par un juriste).
export default function Page() {
  return (
    <LegalPage title="Conditions générales de vente">
      <h2>Objet</h2>
      <p>Les présentes conditions régissent la réservation de courses de transport de personnes avec chauffeur (VTC) proposées par [raison sociale] dans la région Grand Est.</p>
      <h2>Réservation</h2>
      <p>La réservation s&apos;effectue en ligne au moins {BOOKING_RULES.minLeadMinutes} minutes avant l&apos;heure de prise en charge. Le départ et l&apos;arrivée doivent se situer dans la région Grand Est.</p>
      <h2>Prix et paiement</h2>
      <p>Le prix est calculé avant la réservation selon la distance du trajet et affiché TTC. Il est payé intégralement en ligne au moment de la réservation. Une majoration s&apos;applique pour les départs entre 22 h et 6 h ainsi que le samedi et le dimanche.</p>
      <h2>Confirmation</h2>
      <p>Chaque réservation est soumise à la confirmation du chauffeur. En cas de refus, le client est remboursé intégralement.</p>
      <h2>Annulation</h2>
      <p>[Conditions d&apos;annulation à la demande du client à définir avec le chauffeur.] Toute course annulée par le chauffeur est remboursée intégralement.</p>
      <h2>Modification</h2>
      <p>Une réservation payée ne peut pas être modifiée en ligne. Contactez le chauffeur par téléphone.</p>
    </LegalPage>
  );
}
