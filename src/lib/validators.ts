import { z } from "zod";
export const phoneRegex = /^(62|0)8[1-9][0-9]{6,11}$/;

export const PassengerSchema = z.object({
  name: z.string().min(2).max(100),
  idNumber: z.string().max(50).optional().or(z.literal("")),
});

export const CreateBookingSchema = z.object({
  scheduleId: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().regex(phoneRegex, "Nomor WhatsApp tidak valid"),
  pickupAddress: z.string().max(300).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal("")),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passengers: z.array(PassengerSchema).min(1).max(20),
});

export const CreateCharterSchema = z.object({
  vehicleTypeId: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  pickupAddress: z.string().min(3).max(300),
  dropAddress: z.string().min(3).max(300),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationDays: z.coerce.number().int().min(1).max(30),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().regex(phoneRegex, "Nomor WhatsApp tidak valid"),
  note: z.string().max(500).optional().or(z.literal("")),
  passengerCount: z.coerce.number().int().min(1).max(50),
});

export const LookupBookingSchema = z.object({
  code: z.string().min(3).max(50),
  phone: z.string().regex(phoneRegex, "Nomor WhatsApp tidak valid"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type CreateCharterInput = z.infer<typeof CreateCharterSchema>;
export type LookupBookingInput = z.infer<typeof LookupBookingSchema>;
