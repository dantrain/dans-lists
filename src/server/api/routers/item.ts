import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { items, lists } from "~/server/db/schema";
import { getNextRank } from "../utils";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ listId: z.string().cuid2(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.query.lists.findFirst({
        where: eq(lists.id, input.listId),
        columns: {
          ownerId: true,
        },
        with: {
          items: {
            columns: {
              rank: true,
            },
            orderBy: [desc(items.rank)],
            limit: 1,
          },
        },
      });

      if (list?.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const beforeItem = list.items[0];

      return ctx.db.insert(items).values({
        id: createId(),
        title: input.title,
        rank: getNextRank(beforeItem),
        listId: input.listId,
      });
    }),

  rank: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid2(),
          beforeId: z.optional(z.string().cuid2()),
          afterId: z.optional(z.string().cuid2()),
        })
        .refine((_) => _.beforeId ?? _.afterId),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("rank item");
    }),
});
