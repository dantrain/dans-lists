export const daysOfWeek = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type Weekday = (typeof daysOfWeek)[number];

export const theDayToday = Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "Europe/London",
}).format(new Date()) as Weekday;
