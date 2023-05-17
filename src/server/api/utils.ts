import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LexoRank } from "lexorank";
import { daysOfWeek, getNow, type Weekday } from "~/utils/date";

dayjs.extend(utc);

const getTodayDateRange = (tzOffset: number) => ({
  gte: dayjs().utcOffset(tzOffset).startOf("day").toISOString(),
  lt: dayjs().utcOffset(tzOffset).endOf("day").toISOString(),
});

export const getWeekDateRange = (tzOffset: number) => ({
  gte: dayjs()
    .utcOffset(tzOffset)
    .subtract(1, "week")
    .startOf("day")
    .toISOString(),
  lt: dayjs().utcOffset(tzOffset).endOf("day").toISOString(),
});

const getDaysAgoDateRange = (daysAgo: number, tzOffset: number) => ({
  gte: dayjs()
    .utcOffset(tzOffset)
    .subtract(daysAgo, "day")
    .startOf("day")
    .toDate(),
  lt: dayjs()
    .utcOffset(tzOffset)
    .subtract(daysAgo, "day")
    .endOf("day")
    .toDate(),
});

export const getRelevantEvents = <
  TEvent extends {
    createdAt: Date;
  }
>(
  list: {
    repeatsMon: boolean;
    repeatsTue: boolean;
    repeatsWed: boolean;
    repeatsThu: boolean;
    repeatsFri: boolean;
    repeatsSat: boolean;
    repeatsSun: boolean;
  },
  events: TEvent[],
  tzOffset: number
) => {
  const now = getNow();
  const todayIndex = daysOfWeek.findIndex((day) => day === now.today);

  let lastValidDaysAgo = 1;

  while (
    lastValidDaysAgo < 8 &&
    list[
      `repeats${
        daysOfWeek[((todayIndex - lastValidDaysAgo) % 7) + 7] as Weekday
      }`
    ] === false
  ) {
    lastValidDaysAgo++;
  }

  const lastValidDayDateRange = getDaysAgoDateRange(lastValidDaysAgo, tzOffset);

  const todayEvents = events.filter(
    (event) => event.createdAt >= new Date(getTodayDateRange(tzOffset).gte)
  );

  const lastValidDayEvents = events.filter(
    (event) =>
      event.createdAt >= lastValidDayDateRange.gte &&
      event.createdAt < lastValidDayDateRange.lt
  );

  return {
    todayEvent: todayEvents[0],
    lastValidDayEvent: lastValidDayEvents[0],
  };
};

type RankItem = { rank: string } | null;

export const getNextRank = (beforeItem?: RankItem) =>
  beforeItem
    ? LexoRank.parse(beforeItem.rank).genNext().toString()
    : LexoRank.middle().toString();

export const getRankBetween = (beforeItem: RankItem, afterItem: RankItem) => {
  let rank: LexoRank;

  if (!beforeItem && afterItem) {
    rank = LexoRank.parse(afterItem.rank).genPrev();
  } else if (beforeItem && !afterItem) {
    rank = LexoRank.parse(beforeItem.rank).genNext();
  } else if (beforeItem && afterItem) {
    rank = LexoRank.parse(beforeItem.rank).between(
      LexoRank.parse(afterItem.rank)
    );
  } else {
    throw new Error();
  }

  return rank.toString();
};
