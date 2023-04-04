import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDayDateRange = (timezone: string) => ({
  gte: dayjs().tz(timezone).startOf("day").toISOString(),
  lte: dayjs().tz(timezone).endOf("day").toISOString(),
});
