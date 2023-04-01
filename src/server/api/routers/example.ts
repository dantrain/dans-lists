import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const getDayDateRange = (timezoneOffset: number) => {
  const gte = new Date();
  const lte = new Date();

  gte.setUTCHours(0, 0, 0, 0);
  lte.setUTCHours(23, 59, 59, 999);

  gte.setMinutes(gte.getMinutes() + timezoneOffset);
  lte.setMinutes(lte.getMinutes() + timezoneOffset);

  return {
    gte: gte.toISOString(),
    lte: lte.toISOString(),
  };
};

export const exampleRouter = createTRPCRouter({
  getLists: protectedProcedure
    .input(
      z.object({
        timezoneOffset: z.number(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.list.findMany({
        where: { ownerId: ctx.session.user.id },
        select: {
          id: true,
          title: true,
          items: {
            select: {
              id: true,
              title: true,
              events: {
                where: {
                  createdAt: getDayDateRange(input.timezoneOffset),
                },
                take: 1,
                select: { status: { select: { name: true } } },
              },
            },
          },
        },
      });
    }),

  upsertEvent: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        statusName: z.string(),
        timezoneOffset: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { events } = await ctx.prisma.item.findUniqueOrThrow({
        where: { id: input.itemId },
        select: {
          events: {
            where: {
              createdAt: getDayDateRange(input.timezoneOffset),
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

  deleteEvents: protectedProcedure.mutation(({ ctx }) =>
    ctx.prisma.event.deleteMany()
  ),
});
