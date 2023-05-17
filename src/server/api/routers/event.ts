import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getRelevantEvents, getWeekDateRange } from "../utils";

export const eventRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
        statusName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { list, events } = await ctx.prisma.item.findFirstOrThrow({
        where: { id: input.itemId, list: { ownerId: ctx.session.user.id } },
        select: {
          events: {
            where: {
              createdAt: getWeekDateRange(ctx.tzOffset),
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

      const { todayEvent, lastValidDayEvent } = getRelevantEvents(
        list,
        events,
        ctx.tzOffset
      );

      let streak = 0;

      if (lastValidDayEvent && lastValidDayEvent.status.name !== "PENDING") {
        streak = lastValidDayEvent.streak;
      }

      if (input.statusName === "COMPLETE") {
        streak++;
      }

      if (todayEvent) {
        await ctx.prisma.event.update({
          where: { id: todayEvent.id },
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
