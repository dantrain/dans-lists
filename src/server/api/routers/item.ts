import { TRPCError } from "@trpc/server";
import { LexoRank } from "lexorank";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ listId: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUniqueOrThrow({
        where: { id: input.listId },
        select: {
          ownerId: true,
          items: {
            select: { rank: true },
            take: 1,
            orderBy: { rank: "desc" },
          },
        },
      });

      if (list.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const prev = list.items[0];

      return ctx.prisma.item.create({
        data: {
          title: input.title,
          list: { connect: { id: input.listId } },
          rank: prev
            ? LexoRank.parse(prev.rank).genNext().toString()
            : LexoRank.middle().toString(),
        },
      });
    }),

  edit: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.updateMany({
        where: { id: input.id, list: { ownerId: ctx.session.user.id } },
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
        ctx.prisma.item.findFirst({
          where: { id: input.beforeId ?? "%other" },
          select: { rank: true },
        }),
        ctx.prisma.item.findFirst({
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

      return ctx.prisma.item.update({
        where: { id: input.id },
        data: { rank: newRank.toString() },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.deleteMany({
        where: { id: input.id, list: { ownerId: ctx.session.user.id } },
      })
    ),
});
