import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getDayDateRange } from "../utils";

export const eventRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
        statusName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { events } = await ctx.prisma.item.findFirstOrThrow({
        where: { id: input.itemId, list: { ownerId: ctx.session.user.id } },
        select: {
          events: {
            where: {
              createdAt: getDayDateRange(),
            },
            take: 1,
          },
        },
      });

      if (events.length && events[0]) {
        await ctx.prisma.event.update({
          where: { id: events[0].id },
          data: {
            status: { connect: { name: input.statusName } },
          },
        });
      } else {
        await ctx.prisma.event.create({
          data: {
            item: { connect: { id: input.itemId } },
            status: { connect: { name: input.statusName } },
          },
        });
      }
    }),
});
