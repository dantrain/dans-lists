import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getTodayDateRange, getYesterdayDateRange } from "../utils";

export const eventRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
        statusName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [today, yesterday] = await Promise.all([
        ctx.prisma.item.findFirstOrThrow({
          where: { id: input.itemId, list: { ownerId: ctx.session.user.id } },
          select: {
            events: {
              where: {
                createdAt: getTodayDateRange(),
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        }),
        ctx.prisma.item.findFirstOrThrow({
          where: { id: input.itemId, list: { ownerId: ctx.session.user.id } },
          select: {
            events: {
              where: {
                createdAt: getYesterdayDateRange(),
              },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                status: true,
                streak: true,
              },
            },
          },
        }),
      ]);

      let streak = 0;

      if (
        yesterday.events.length &&
        yesterday.events[0] &&
        yesterday.events[0].status.name !== "PENDING"
      ) {
        streak = yesterday.events[0].streak;
      }

      if (input.statusName === "COMPLETE") {
        streak++;
      }

      if (today.events.length && today.events[0]) {
        await ctx.prisma.event.update({
          where: { id: today.events[0].id },
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
