import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ listId: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUniqueOrThrow({
        where: { id: input.listId },
        select: { ownerId: true },
      });

      if (list.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.prisma.item.create({
        data: {
          title: input.title,
          list: { connect: { id: input.listId } },
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.deleteMany({
        where: { id: input.id, list: { ownerId: ctx.session.user.id } },
      })
    ),
});
