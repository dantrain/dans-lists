import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  getLists: protectedProcedure
    .input(
      z.object({
        gte: z.date(),
        lte: z.date(),
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
                  createdAt: {
                    gte: input.gte.toISOString(),
                    lte: input.lte.toISOString(),
                  },
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
        gte: z.date(),
        lte: z.date(),
        statusName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { events } = await ctx.prisma.item.findUniqueOrThrow({
        where: { id: input.itemId },
        select: {
          events: {
            where: {
              createdAt: {
                gte: input.gte.toISOString(),
                lte: input.lte.toISOString(),
              },
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
