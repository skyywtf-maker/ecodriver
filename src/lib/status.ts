import type { BookingStatus } from "@prisma/client";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Paiement en cours",
  PENDING_DRIVER: "En attente de confirmation",
  CONFIRMED: "Confirmée",
  REFUSED: "Refusée, remboursée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée, remboursée",
};

export const STATUS_TONE: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "bg-white/10 text-white/70",
  PENDING_DRIVER: "bg-[#FF9F0A]/15 text-[#FFB340]",
  CONFIRMED: "bg-[#30D158]/15 text-[#30D158]",
  REFUSED: "bg-[#FF453A]/15 text-[#FF6961]",
  COMPLETED: "bg-white/10 text-white/70",
  CANCELLED: "bg-[#FF453A]/15 text-[#FF6961]",
};
