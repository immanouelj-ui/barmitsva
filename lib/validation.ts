import { z } from "zod";
const short = z.string().trim().max(160);
const date = z.iso.date();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const invitationSchema = z
  .object({
    event_type: z.enum(["mariage", "bar-mitsva"]),
    theme: z.enum(["azure", "olivier", "rose", "minuit"]),
    title: short.min(2),
    hosts: short,
    event_date: date,
    event_time: time,
    venue: short.min(2),
    address: z.string().trim().max(350),
    reception_venue: short,
    reception_address: z.string().trim().max(350),
    reception_time: z.union([time, z.literal("")]),
    deadline: z.union([date, z.literal("")]),
    message: z.string().trim().max(2000),
    published: z.boolean(),
  })
  .refine((v) => !v.deadline || v.deadline <= v.event_date, {
    message: "La date limite doit précéder ou égaler la date de la fête.",
    path: ["deadline"],
  });
export const rsvpSchema = z
  .object({
    slug: z.uuid(),
    guest_token: z.uuid(),
    name: short.min(2),
    attending: z.boolean(),
    guests: z.number().int().min(0).max(20),
    message: z.string().trim().max(1000),
    website: z.string().max(0),
  })
  .refine((v) => (v.attending ? v.guests >= 1 : v.guests === 0), {
    message: "Nombre de personnes invalide.",
  });
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
