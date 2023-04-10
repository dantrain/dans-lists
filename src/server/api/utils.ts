import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { LexoRank } from "lexorank";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getDayDateRange = () => ({
  gte: dayjs().tz("Europe/London").startOf("day").toISOString(),
  lte: dayjs().tz("Europe/London").endOf("day").toISOString(),
});

type RankItem = { rank: string } | null;

export const getRank = (beforeItem: RankItem, afterItem: RankItem) => {
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
