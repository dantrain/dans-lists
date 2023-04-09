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
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.create({
        data: {
          title: input.title,
          owner: { connect: { id: ctx.session.user.id } },
        },
      })
    ),

  edit: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.updateMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
        data: { title: input.title },
      })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.list.deleteMany({
        where: { id: input.id, ownerId: ctx.session.user.id },
      })
    ),
});
