import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDayDateRange = () => ({
  gte: dayjs().tz("Europe/London").startOf("day").toISOString(),
  lte: dayjs().tz("Europe/London").endOf("day").toISOString(),
});
