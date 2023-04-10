import { LexoRank } from "lexorank";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getDayDateRange } from "../utils";

export const listRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
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
      const [prev] = await ctx.prisma.list.findMany({
        where: { ownerId: ctx.session.user.id },
        select: { rank: true },
        take: 1,
        orderBy: { rank: "desc" },
      });

      return ctx.prisma.list.create({
        data: {
          title: input.title,
          owner: { connect: { id: ctx.session.user.id } },
          rank: prev
            ? LexoRank.parse(prev.rank).genNext().toString()
            : LexoRank.middle().toString(),
        },
      });
    }),

  edit: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: { title: input.title },
      })
    ),

  rank: protectedProcedure
    .input(
      z
        .object({
          id: z.string(),
          beforeId: z.optional(z.string()),
          afterId: z.optional(z.string()),
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

      let newRank: LexoRank;

      if (!beforeItem && afterItem) {
        newRank = LexoRank.parse(afterItem.rank).genPrev();
      } else if (beforeItem && !afterItem) {
        newRank = LexoRank.parse(beforeItem.rank).genNext();
      } else if (beforeItem && afterItem) {
        newRank = LexoRank.parse(beforeItem.rank).between(
          LexoRank.parse(afterItem.rank)
        );
      } else {
        throw new Error();
      }

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: { rank: newRank.toString() },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.deleteMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
      })
    ),
});
