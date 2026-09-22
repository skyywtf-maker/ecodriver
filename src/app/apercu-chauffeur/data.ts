import type { RideRow } from "../chauffeur/RidesPanel";
import { STATUS_TONE } from "@/lib/status";

/**
 * Données FICTIVES de l'aperçu public : rien n'est lu en base. Les noms
 * portent « (exemple) », les numéros et emails sont volontairement factices.
 */
export type DemoRide = RideRow & {
  reference: string;
  phone: string;
  email: string;
  passengers: number;
  luggage: number;
  distance: string;
  note: string;
  steps: { label: string; at: string }[];
};

const ride = (
  n: number,
  when: string,
  first: string,
  from: string,
  to: string,
  price: string,
  status: RideRow["status"],
  more: Partial<DemoRide> = {}
): DemoRide => ({
  id: `exemple-${n}`,
  reference: `ED-EX${String(n).padStart(3, "0")}`,
  when,
  name: `${first} (exemple)`,
  from,
  to,
  price,
  status,
  tone: STATUS_TONE[status],
  enRoute: false,
  arrived: false,
  phone: "06 00 00 00 00",
  email: "client@exemple.test",
  passengers: 1,
  luggage: 1,
  distance: "—",
  note: "",
  steps: [{ label: "Réservée", at: "la veille" }],
  ...more,
});

export const DEMO_RIDES: DemoRide[] = [
  ride(1, "mer. 23 sept., 07:55", "Camille", "Gare de Strasbourg", "Aéroport de Strasbourg-Entzheim", "39,00 €", "PENDING_DRIVER", {
    passengers: 2, luggage: 3, distance: "16,2 km · 21 min", note: "Vol AF1234 à 7 h 10",
  }),
  ride(2, "mer. 23 sept., 17:55", "Thomas", "Parlement européen, Strasbourg", "Gare de Strasbourg", "17,00 €", "PENDING_DRIVER", {
    distance: "4,1 km · 11 min",
  }),
  ride(3, "mar. 22 sept., 13:55", "Léa", "Cathédrale de Strasbourg", "Aéroport de Francfort", "499,00 €", "CONFIRMED", {
    enRoute: true, passengers: 3, luggage: 4, distance: "218 km · 2 h 30",
    steps: [{ label: "Réservée", at: "lun. 21 sept., 11:02" }, { label: "Confirmée", at: "lun. 21 sept., 12:10" }, { label: "En route", at: "mar. 22 sept., 13:40" }],
  }),
  ride(4, "jeu. 24 sept., 13:55", "Hugo", "Place des Halles, Strasbourg", "Gare de Colmar", "171,00 €", "CONFIRMED", {
    passengers: 2, luggage: 2, distance: "74 km · 55 min", note: "Siège enfant",
    steps: [{ label: "Réservée", at: "mar. 22 sept., 09:15" }, { label: "Confirmée", at: "mar. 22 sept., 09:40" }],
  }),
  ride(5, "lun. 21 sept., 05:55", "Sarah", "Gare de Strasbourg", "Rivétoile, Strasbourg", "15,00 €", "COMPLETED", { distance: "3,2 km · 9 min" }),
  ride(6, "sam. 19 sept., 07:55", "Nicolas", "Aéroport de Strasbourg-Entzheim", "Cathédrale de Strasbourg", "33,00 €", "COMPLETED", { distance: "15,8 km · 20 min" }),
  ride(7, "ven. 18 sept., 07:55", "Paul", "Cathédrale de Strasbourg", "Gare de Colmar", "166,00 €", "REFUSED", { distance: "72 km · 54 min" }),
  ride(8, "mar. 15 sept., 09:55", "Julie", "Rivétoile, Strasbourg", "Parlement européen, Strasbourg", "19,00 €", "COMPLETED", { distance: "5,9 km · 14 min" }),
  ride(9, "lun. 14 sept., 03:55", "Emma", "Place des Halles, Strasbourg", "Aéroport de Strasbourg-Entzheim", "32,00 €", "CANCELLED", { distance: "15,1 km · 19 min" }),
  ride(10, "jeu. 10 sept., 09:55", "Marc", "Gare de Strasbourg", "Aéroport de Strasbourg-Entzheim", "35,00 €", "COMPLETED", { distance: "16,2 km · 21 min" }),
];

export const demoRide = (id: string) => DEMO_RIDES.find((r) => r.id === id);
