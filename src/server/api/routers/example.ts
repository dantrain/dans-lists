import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

dayjs.extend(utc);
dayjs.extend(timezone);

const getDayDateRange = (timezone: string) => ({
  gte: dayjs().tz(timezone).startOf("day").toISOString(),
  lte: dayjs().tz(timezone).endOf("day").toISOString(),
});

export const exampleRouter = createTRPCRouter({
  getLists: protectedProcedure
    .input(
      z.object({
        timezone: z.string(),
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
                  createdAt: getDayDateRange(input.timezone),
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
        timezone: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { events } = await ctx.prisma.item.findUniqueOrThrow({
        where: { id: input.itemId },
        select: {
          events: {
            where: {
              createdAt: getDayDateRange(input.timezone),
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
