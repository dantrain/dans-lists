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

export const getNow = () => {
  const now = new Date();

  return {
    today: Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "Europe/London",
    }).format(now) as Weekday,
    minutes: now.getHours() * 60 + now.getMinutes(),
  };
};
