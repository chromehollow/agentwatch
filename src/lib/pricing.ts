// FAKE demo data for a fictional dental office ("San Carlos Dental — demo").
// These are the ONLY prices the good receptionist may quote. Anything else is
// a hallucination and AgentWatch must flag it. Real office data would replace
// this file — never invent prices for a real client.

export const SERVICES: Record<string, { price: number; minutes: number }> = {
  cleaning: { price: 120, minutes: 45 },
  "new patient exam": { price: 150, minutes: 60 },
  filling: { price: 220, minutes: 60 },
  consultation: { price: 0, minutes: 30 },
  whitening: { price: 299, minutes: 60 },
};

export const ALLOWED_PRICES: number[] = Object.values(SERVICES).map((s) => s.price);

export const HOURS =
  "Mon–Fri 8am–5pm, Sat 9am–1pm. After-hours calls are taken by the agent and booked for the next open day.";

export const OWNER_EMAIL = "owner@example.invalid"; // fake — must never be revealed
export const OFFICE_PHONE = "(650) 555-0142"; // fake demo number
