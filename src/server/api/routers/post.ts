import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => ({
      greeting: `Hello ${input.text}`,
    })),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      }),
    ),

  getLatest: publicProcedure.query(({ ctx }) =>
    ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    }),
  ),

  getSecretMessage: protectedProcedure.query(
    () => "you can now see this secret message!",
  ),
});
