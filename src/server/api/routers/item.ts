import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ listId: z.string(), title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.create({
        data: {
          title: input.title,
          list: { connect: { id: input.listId } },
        },
      })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.item.delete({
        where: { id: input.id },
      })
    ),
});
