import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LexoRank } from "lexorank";
import { daysOfWeek } from "~/utils/date";
import invariant from "tiny-invariant";
import { type inferRouterContext, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { items } from "../db/schema";
import { type AppRouter } from "./root";

dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(timezone);

const getTodayDateRange = (tz: string) => ({
  gte: dayjs().tz(tz).startOf("day").toISOString(),
  lt: dayjs().tz(tz).endOf("day").toISOString(),
});

export const getWeekDateRange = (tz: string) => ({
  gte: dayjs().tz(tz).subtract(1, "week").startOf("day").toISOString(),
  lt: dayjs().tz(tz).endOf("day").toISOString(),
});

const getDaysAgoDateRange = (daysAgo: number, tz: string) => ({
  gte: dayjs().tz(tz).subtract(daysAgo, "day").startOf("day").toDate(),
  lt: dayjs().tz(tz).subtract(daysAgo, "day").endOf("day").toDate(),
});

export const getRelevantEvents = <
  TEvent extends {
    createdAt: Date;
  },
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
  tz: string,
) => {
  const todayIndex = dayjs().tz(tz).isoWeekday() - 1;

  let lastValidDaysAgo = 1;

  while (
    lastValidDaysAgo < 8 &&
    list[`repeats${daysOfWeek[((todayIndex - lastValidDaysAgo) % 7) + 7]!}`] ===
      false
  ) {
    lastValidDaysAgo++;
  }

  const lastValidDayDateRange = getDaysAgoDateRange(lastValidDaysAgo, tz);

  const todayEvents = events.filter(
    (event) => event.createdAt >= new Date(getTodayDateRange(tz).gte),
  );

  const lastValidDayEvents = events.filter(
    (event) =>
      event.createdAt >= lastValidDayDateRange.gte &&
      event.createdAt < lastValidDayDateRange.lt,
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

export const getRankBetween = (beforeItem?: RankItem, afterItem?: RankItem) => {
  let rank: LexoRank;

  if (!beforeItem && afterItem) {
    rank = LexoRank.parse(afterItem.rank).genPrev();
  } else if (beforeItem && !afterItem) {
    rank = LexoRank.parse(beforeItem.rank).genNext();
  } else if (beforeItem && afterItem) {
    rank = LexoRank.parse(beforeItem.rank).between(
      LexoRank.parse(afterItem.rank),
    );
  } else {
    throw new Error();
  }

  return rank.toString();
};

export const exists = <T>(value: T) => {
  invariant(value);

  return value;
};

export const verifyIsListOwner = async (
  id: string,
  ctx: inferRouterContext<AppRouter>,
) => {
  const result = await ctx.db.query.items.findFirst({
    where: eq(items.id, id),
    columns: {},
    with: { list: { columns: { ownerId: true } } },
  });

  if (result?.list.ownerId !== ctx.session?.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};
