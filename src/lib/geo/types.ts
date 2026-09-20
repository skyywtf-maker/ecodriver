export type Place = {
  /** Nom affiché dans la liste. */
  label: string;
  /** Adresse résolue, affichée sous le nom pour les lieux d'usage. */
  hint?: string;
  lat: number;
  lng: number;
  inGrandEst: boolean;
};

export type Route = {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
};
