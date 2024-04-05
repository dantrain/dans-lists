import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
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

const getTodayDateRange = (tzOffset: number) => ({
  gte: dayjs().utcOffset(-tzOffset).startOf("day").toISOString(),
  lt: dayjs().utcOffset(-tzOffset).endOf("day").toISOString(),
});

export const getWeekDateRange = (tzOffset: number) => ({
  gte: dayjs()
    .utcOffset(-tzOffset)
    .subtract(1, "week")
    .startOf("day")
    .toISOString(),
  lt: dayjs().utcOffset(-tzOffset).endOf("day").toISOString(),
});

const getDaysAgoDateRange = (daysAgo: number, tzOffset: number) => ({
  gte: dayjs()
    .utcOffset(-tzOffset)
    .subtract(daysAgo, "day")
    .startOf("day")
    .toDate(),
  lt: dayjs()
    .utcOffset(-tzOffset)
    .subtract(daysAgo, "day")
    .endOf("day")
    .toDate(),
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
  tzOffset: number,
) => {
  const todayIndex = dayjs().utcOffset(-tzOffset).isoWeekday() - 1;

  let lastValidDaysAgo = 1;

  while (
    lastValidDaysAgo < 8 &&
    list[`repeats${daysOfWeek[((todayIndex - lastValidDaysAgo) % 7) + 7]!}`] ===
      false
  ) {
    lastValidDaysAgo++;
  }

  const lastValidDayDateRange = getDaysAgoDateRange(lastValidDaysAgo, tzOffset);

  const todayEvents = events.filter(
    (event) => event.createdAt >= new Date(getTodayDateRange(tzOffset).gte),
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
