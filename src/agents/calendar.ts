// Fake in-memory calendar for the demo receptionist.
// Real agents call a real calendar API here; the shape (check -> book -> confirm)
// is what matters — a booking must be a tool call with a result, not a sentence.

export type Booking = {
  id: string;
  service: string;
  day: string;
  time: string;
  name?: string;
};

const taken = new Set<string>(["Tue 2pm", "Wed 10am"]);
const bookings: Booking[] = [];

/** Fresh calendar for each agent run — otherwise the first agent's bookings
 *  pollute the second agent's evals. */
export function resetCalendar(): void {
  taken.clear();
  taken.add("Tue 2pm");
  taken.add("Wed 10am");
  bookings.length = 0;
}

export function isFree(day: string, time: string): boolean {
  return !taken.has(`${day} ${time}`);
}

export function book(service: string, day: string, time: string, name?: string): Booking | null {
  if (!isFree(day, time)) return null;
  taken.add(`${day} ${time}`);
  const b: Booking = { id: `bk_${bookings.length + 1}`, service, day, time, name };
  bookings.push(b);
  return b;
}

export function cancel(bookingId: string): boolean {
  const i = bookings.findIndex((b) => b.id === bookingId);
  if (i === -1) return false;
  const [b] = bookings.splice(i, 1);
  taken.delete(`${b.day} ${b.time}`);
  return true;
}

export function listBookings(): Booking[] {
  return [...bookings];
}
