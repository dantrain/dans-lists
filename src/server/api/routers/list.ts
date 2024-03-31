import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getNextRank, getRelevantEvents } from "../utils";
import { events, items, lists } from "~/server/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { omit } from "lodash-es";

export const listRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.lists.findMany({
      where: eq(lists.ownerId, ctx.session.user.id),
      orderBy: [asc(lists.rank)],
      columns: {
        id: true,
        title: true,
        repeatsMon: true,
        repeatsTue: true,
        repeatsWed: true,
        repeatsThu: true,
        repeatsFri: true,
        repeatsSat: true,
        repeatsSun: true,
        startMinutes: true,
        endMinutes: true,
      },
      with: {
        items: {
          orderBy: [asc(items.rank)],
          columns: {
            id: true,
            title: true,
          },
          with: {
            events: {
              orderBy: [desc(events.createdAt)],
              columns: {
                createdAt: true,
                streak: true,
              },
              with: {
                status: {
                  columns: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const data = result.map((list) => {
      return {
        ...list,
        items: list.items.map((item) => {
          const { todayEvent, lastValidDayEvent } = getRelevantEvents(
            list,
            item.events,
            0, // ctx.tzOffset,
          );

          return {
            ...omit(item, "events"),
            event: todayEvent,
            streak: lastValidDayEvent?.streak ?? 0,
          };
        }),
      };
    });

    return data;
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [beforeItem] = await ctx.db
        .select({ rank: lists.rank })
        .from(lists)
        .orderBy(desc(lists.rank))
        .limit(1);

      return ctx.db
        .insert(lists)
        .values({
          id: createId(),
          title: input.title,
          rank: getNextRank(beforeItem),
          ownerId: ctx.session.user.id,
        })
        .returning();
    }),

  rank: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid(),
          beforeId: z.optional(z.string().cuid()),
          afterId: z.optional(z.string().cuid()),
        })
        .refine((_) => _.beforeId ?? _.afterId),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("yoyo");
    }),
});
