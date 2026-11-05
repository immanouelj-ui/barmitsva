export const templates = [
  {
    id: "azure",
    name: "Éclat d’azur",
    kind: "bar-mitsva",
    description: "Aquarelle bleue, papier ivoire et éclats d’or.",
    label: "Aquarelle · Or",
  },
  {
    id: "olivier",
    name: "Sous l’olivier",
    kind: "mariage",
    description: "Une élégance naturelle, douce et intemporelle.",
    label: "Sauge · Ivoire",
  },
  {
    id: "rose",
    name: "Promesse",
    kind: "mariage",
    description: "Des nuances poudrées pour une journée romantique.",
    label: "Rose · Champagne",
  },
  {
    id: "minuit",
    name: "Minuit doré",
    kind: "bar-mitsva",
    description: "Une célébration lumineuse sur fond bleu nuit.",
    label: "Nuit · Or",
  },
] as const;
export type Theme = (typeof templates)[number]["id"];
export type Invitation = {
  id: string;
  slug: string;
  owner_id?: string;
  event_type: "mariage" | "bar-mitsva";
  theme: Theme;
  title: string;
  hosts: string;
  event_date: string;
  event_time: string;
  venue: string;
  address: string;
  reception_venue: string;
  reception_address: string;
  reception_time: string;
  deadline: string | null;
  message: string;
  published: boolean;
  created_at?: string;
};
export type RSVP = {
  id: string;
  invitation_id: string;
  name: string;
  attending: boolean;
  guests: number;
  message: string;
  created_at: string;
  updated_at: string;
};
export const demo: Invitation = {
  id: "demo",
  slug: "demo",
  event_type: "bar-mitsva",
  theme: "azure",
  title: "David Michael",
  hosts: "Sarah et Daniel",
  event_date: "2027-09-19",
  event_time: "10:00",
  venue: "Synagogue Beth El",
  address: "Paris",
  reception_venue: "Le Jardin d’hiver",
  reception_address: "Paris",
  reception_time: "14:00",
  deadline: "2027-08-01",
  message:
    "Avec une grande joie, nous vous invitons à partager ce moment unique et à célébrer ensemble cette belle étape de notre vie.",
  published: false,
};
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}
