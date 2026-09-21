import { z } from "zod";
import { BOOKING_RULES, VEHICLE_IDS } from "@/config/pricing";

export const pointSchema = z.object({
  label: z.string().min(3).max(300),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const tripSchema = z.object({
  from: pointSchema,
  to: pointSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  passengers: z.number().int().min(1).max(BOOKING_RULES.maxPassengers),
  luggage: z.number().int().min(0).max(BOOKING_RULES.maxLuggage),
  vehicle: z.enum(VEHICLE_IDS).optional(),
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(80),
  lastName: z.string().trim().min(1, "Nom requis").max(80),
  phone: z
    .string()
    .trim()
    .min(6, "Téléphone requis")
    .max(30)
    .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide"),
  email: z.string().trim().email("Adresse email invalide").max(200),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const bookingRequestSchema = z.object({
  trip: tripSchema,
  contact: contactSchema,
  acceptedTerms: z.literal(true),
});

export type TripInput = z.infer<typeof tripSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
