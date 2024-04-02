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

export const getNow = (tzOffset: number) => {
  const now = new Date();

  now.setHours(now.getUTCHours() - tzOffset / 60);

  return {
    today: Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(now) as Weekday,
    minutes: now.getHours() * 60 + now.getMinutes(),
  };
};
