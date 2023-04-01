import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.item.findMany();
  }),

  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session.user.name) throw new Error();
    return `Logged in as ${ctx.session.user.name} - you can now see this secret message!`;
  }),
});
