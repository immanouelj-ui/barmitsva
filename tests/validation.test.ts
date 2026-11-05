import test from "node:test";
import assert from "node:assert/strict";
import { rsvpSchema, invitationSchema, csvCell } from "../lib/validation";
const response = {
  slug: crypto.randomUUID(),
  guest_token: crypto.randomUUID(),
  name: "Famille Cohen",
  attending: true,
  guests: 3,
  message: "Avec plaisir",
  website: "",
};
test("validates RSVPs and rejects incorrect attendance, oversized groups and honeypot", () => {
  assert.ok(rsvpSchema.safeParse(response).success);
  for (const patch of [
    { guests: 0 },
    { guests: 21 },
    { attending: false, guests: 3 },
    { name: "x" },
    { website: "spam" },
    { guest_token: "bad" },
    { message: "x".repeat(1001) },
  ])
    assert.equal(
      rsvpSchema.safeParse({ ...response, ...patch }).success,
      false,
    );
  assert.ok(
    rsvpSchema.safeParse({ ...response, attending: false, guests: 0 }).success,
  );
});
test("invitation validates dates, times and response deadline", () => {
  const data = {
    event_type: "mariage",
    theme: "rose",
    title: "Sarah & Nathan",
    hosts: "Les familles",
    event_date: "2027-09-19",
    event_time: "10:00",
    venue: "Le domaine",
    address: "Paris",
    reception_venue: "",
    reception_address: "",
    reception_time: "",
    deadline: "2027-08-01",
    message: "Bienvenue",
    published: true,
  };
  assert.ok(invitationSchema.safeParse(data).success);
  for (const patch of [
    { deadline: "2027-10-01" },
    { event_time: "25:99" },
    { event_date: "2027-02-30" },
  ])
    assert.equal(
      invitationSchema.safeParse({ ...data, ...patch }).success,
      false,
    );
});
test("CSV escapes quotes, delimiters and formula injection", () => {
  assert.equal(csvCell('a;"b"'), '"a;""b"""');
  assert.equal(csvCell("=SUM(1,2)"), `"'=SUM(1,2)"`);
  assert.equal(csvCell(" @evil"), `"' @evil"`);
  assert.equal(csvCell("Bonjour"), '"Bonjour"');
});
