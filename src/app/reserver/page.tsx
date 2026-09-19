import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata: Metadata = { title: "Réserver · Eco Driver" };

export default function ReserverPage() {
  return <BookingFlow />;
}
