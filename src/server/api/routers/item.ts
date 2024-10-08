import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { difference } from "lodash-es";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { items, lists, shuffleChoices } from "~/server/db/schema";
import { getNextRank, getRankBetween, verifyIsListOwner } from "../utils";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ listId: z.string().cuid2(), title: z.string().min(1) }))
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

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        title: z.string().min(1),
        shuffleMode: z.boolean(),
        shuffleChoices: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyIsListOwner(input.id, ctx);
      const choicePromises = [];

      if (input.shuffleMode) {
        const currentChoices = (
          await ctx.db.query.shuffleChoices.findMany({
            where: and(
              eq(shuffleChoices.itemId, input.id),
              eq(shuffleChoices.isDeleted, false),
            ),
          })
        ).map((_) => _.title);

        const choicesToAdd = difference(input.shuffleChoices, currentChoices);

        if (choicesToAdd.length) {
          choicePromises.push(
            ctx.db.insert(shuffleChoices).values(
              choicesToAdd.map((_) => ({
                id: createId(),
                title: _,
                itemId: input.id,
              })),
            ),
          );
        }

        const choicesToRemove = difference(
          currentChoices,
          input.shuffleChoices,
        );

        if (choicesToRemove.length) {
          choicePromises.push(
            ctx.db
              .update(shuffleChoices)
              .set({ isDeleted: true })
              .where(
                and(
                  eq(shuffleChoices.itemId, input.id),
                  inArray(shuffleChoices.title, choicesToRemove),
                ),
              ),
          );
        }
      }

      return Promise.all([
        ctx.db
          .update(items)
          .set({
            title: input.title,
            shuffleMode: !!(input.shuffleMode && input.shuffleChoices.length),
          })
          .where(eq(items.id, input.id)),
        ...choicePromises,
      ]);
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
      await verifyIsListOwner(input.id, ctx);

      const [beforeItem, afterItem] = await Promise.all([
        input.beforeId
          ? ctx.db.query.items.findFirst({
              where: eq(items.id, input.beforeId),
            })
          : null,
        input.afterId
          ? ctx.db.query.items.findFirst({
              where: eq(items.id, input.afterId),
            })
          : null,
      ]);

      return ctx.db
        .update(items)
        .set({ rank: getRankBetween(beforeItem, afterItem) })
        .where(eq(items.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      await verifyIsListOwner(input.id, ctx);

      return ctx.db.delete(items).where(eq(items.id, input.id));
    }),
});
