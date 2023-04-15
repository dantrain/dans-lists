import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { daysOfWeek } from "~/utils/date";
import { getDayDateRange, getNextRank, getRankBetween } from "../utils";

export const listRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({
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
        items: {
          select: {
            id: true,
            title: true,
            events: {
              where: {
                createdAt: getDayDateRange(),
              },
              take: 1,
              select: { status: { select: { name: true } } },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { rank: "asc" },
        },
      },
      orderBy: { rank: "asc" },
    });
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
      })
    ),

  editRepeat: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        repeatDays: z.array(z.enum(daysOfWeek)),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: daysOfWeek.reduce(
          (data, day) => ({
            ...data,
            [`repeats${day}`]: input.repeatDays.includes(day),
          }),
          {}
        ),
      })
    ),

  rank: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid(),
          beforeId: z.optional(z.string().cuid()),
          afterId: z.optional(z.string().cuid()),
        })
        .refine((_) => _.beforeId || _.afterId)
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
      })
    ),
});
