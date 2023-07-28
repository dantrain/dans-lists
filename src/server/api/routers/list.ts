import { isNull, omit } from "lodash";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { daysOfWeek } from "~/utils/date";
import {
  getNextRank,
  getRankBetween,
  getRelevantEvents,
  getWeekDateRange,
} from "../utils";

export const listRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.list.findMany({
      where: { ownerId: ctx.session.user.id },
      select: {
        id: true,
        title: true,
        repeatsMon: true,
        repeatsTue: true,
        repeatsWed: true,
        repeatsThu: true,
        repeatsFri: true,
        repeatsSat: true,
        repeatsSun: true,
        startMinutes: true,
        endMinutes: true,
        items: {
          select: {
            id: true,
            title: true,
            events: {
              where: {
                createdAt: getWeekDateRange(ctx.tzOffset),
              },
              select: {
                status: { select: { name: true } },
                createdAt: true,
                streak: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { rank: "asc" },
        },
      },
      orderBy: { rank: "asc" },
    });

    const data = result.map((list) => {
      return {
        ...list,
        items: list.items.map((item) => {
          const { todayEvent, lastValidDayEvent } = getRelevantEvents(
            list,
            item.events,
            ctx.tzOffset,
          );

          return {
            ...omit(item, "events"),
            event: todayEvent,
            streak: lastValidDayEvent?.streak ?? 0,
          };
        }),
      };
    });

    return data;
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [beforeItem] = await ctx.prisma.list.findMany({
        where: { ownerId: ctx.session.user.id },
        select: { rank: true },
        take: 1,
        orderBy: { rank: "desc" },
      });

      return ctx.prisma.list.create({
        data: {
          title: input.title,
          owner: { connect: { id: ctx.session.user.id } },
          rank: getNextRank(beforeItem),
        },
      });
    }),

  edit: protectedProcedure
    .input(z.object({ id: z.string().cuid(), title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: { title: input.title },
      }),
    ),

  editRepeat: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        repeatDays: z.array(z.enum(daysOfWeek)),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: daysOfWeek.reduce(
          (data, day) => ({
            ...data,
            [`repeats${day}`]: input.repeatDays.includes(day),
          }),
          {},
        ),
      }),
    ),

  editTimeRange: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid(),
          startMinutes: z.nullable(z.number().int().gte(0).lte(1440)),
          endMinutes: z.nullable(z.number().int().gte(0).lte(1440)),
        })
        .refine(
          (_) =>
            isNull(_.startMinutes) ||
            isNull(_.endMinutes) ||
            _.startMinutes <= _.endMinutes,
        ),
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: {
          startMinutes: input.startMinutes,
          endMinutes: input.endMinutes,
        },
      }),
    ),

  rank: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid(),
          beforeId: z.optional(z.string().cuid()),
          afterId: z.optional(z.string().cuid()),
        })
        .refine((_) => _.beforeId || _.afterId),
    )
    .mutation(async ({ ctx, input }) => {
      const [beforeItem, afterItem] = await ctx.prisma.$transaction([
        ctx.prisma.list.findFirst({
          where: { id: input.beforeId ?? "%other" },
          select: { rank: true },
        }),
        ctx.prisma.list.findFirst({
          where: { id: input.afterId ?? "%other" },
          select: { rank: true },
        }),
      ]);

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: { rank: getRankBetween(beforeItem, afterItem) },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.deleteMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
      }),
    ),
});
