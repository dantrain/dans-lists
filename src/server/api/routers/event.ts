import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { daysOfWeek, getNow, type Weekday } from "~/utils/date";
import {
  getDaysAgoDateRange,
  getTodayDateRange,
  getWeekDateRange,
} from "../utils";

export const eventRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
        statusName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.item.findFirstOrThrow({
        where: { id: input.itemId, list: { ownerId: ctx.session.user.id } },
        select: {
          events: {
            where: {
              createdAt: getWeekDateRange(),
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              createdAt: true,
              status: true,
              streak: true,
            },
          },
          list: {
            select: {
              repeatsMon: true,
              repeatsTue: true,
              repeatsWed: true,
              repeatsThu: true,
              repeatsFri: true,
              repeatsSat: true,
              repeatsSun: true,
            },
          },
        },
      });

      const now = getNow();
      const todayIndex = daysOfWeek.findIndex((day) => day === now.today);

      let lastValidDaysAgo = 1;

      while (
        lastValidDaysAgo < 8 &&
        result.list[
          `repeats${
            daysOfWeek[((todayIndex - lastValidDaysAgo) % 7) + 7] as Weekday
          }`
        ] === false
      ) {
        lastValidDaysAgo++;
      }

      const lastValidDayDateRange = getDaysAgoDateRange(lastValidDaysAgo);

      const todayEvents = result.events.filter(
        (event) => event.createdAt >= new Date(getTodayDateRange().gte)
      );

      const lastValidDayEvents = result.events.filter(
        (event) =>
          event.createdAt >= lastValidDayDateRange.gte &&
          event.createdAt < lastValidDayDateRange.lt
      );

      let streak = 0;

      if (
        lastValidDayEvents.length &&
        lastValidDayEvents[0] &&
        lastValidDayEvents[0].status.name !== "PENDING"
      ) {
        streak = lastValidDayEvents[0].streak;
      }

      if (input.statusName === "COMPLETE") {
        streak++;
      }

      if (todayEvents.length && todayEvents[0]) {
        await ctx.prisma.event.update({
          where: { id: todayEvents[0].id },
          data: {
            status: { connect: { name: input.statusName } },
            streak,
          },
        });
      } else {
        await ctx.prisma.event.create({
          data: {
            item: { connect: { id: input.itemId } },
            status: { connect: { name: input.statusName } },
            streak,
          },
        });
      }
    }),
});
