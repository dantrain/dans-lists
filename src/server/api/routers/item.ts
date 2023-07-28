import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getNextRank, getRankBetween } from "../utils";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ listId: z.string().cuid(), title: z.string() }))
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

      const beforeItem = list.items[0];

      return ctx.prisma.item.create({
        data: {
          title: input.title,
          list: { connect: { id: input.listId } },
          rank: getNextRank(beforeItem),
        },
      });
    }),

  edit: protectedProcedure
    .input(z.object({ id: z.string().cuid(), title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.updateMany({
        where: { id: input.id, list: { ownerId: ctx.session.user.id } },
        data: { title: input.title },
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
        ctx.prisma.item.findFirst({
          where: { id: input.beforeId ?? "%other" },
          select: { rank: true },
        }),
        ctx.prisma.item.findFirst({
          where: { id: input.afterId ?? "%other" },
          select: { rank: true },
        }),
      ]);

      return ctx.prisma.item.update({
        where: { id: input.id },
        data: { rank: getRankBetween(beforeItem, afterItem) },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.deleteMany({
        where: { id: input.id, list: { ownerId: ctx.session.user.id } },
      }),
    ),
});
