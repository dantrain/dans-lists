import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import invariant from "tiny-invariant";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { events, items, statuses } from "~/server/db/schema";
import { getRelevantEvents, getWeekDateRange } from "../utils";

export const eventRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid2(),
        statusName: z.string(),
        shuffleChoiceId: z.string().cuid2().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const range = getWeekDateRange(ctx.tzOffset);

      const [status, result] = await Promise.all([
        ctx.db.query.statuses.findFirst({
          where: eq(statuses.name, input.statusName),
        }),
        ctx.db.query.items.findFirst({
          where: eq(items.id, input.itemId),
          columns: {},
          with: {
            events: {
              where: and(
                gte(events.createdAt, new Date(range.gte)),
                lt(events.createdAt, new Date(range.lt)),
              ),
              limit: 1,
              orderBy: [desc(events.createdAt)],
              columns: {
                id: true,
                createdAt: true,
                streak: true,
              },
              with: {
                status: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
            list: {
              columns: {
                ownerId: true,
                repeatsMon: true,
                repeatsTue: true,
                repeatsWed: true,
                repeatsThu: true,
                repeatsFri: true,
                repeatsSat: true,
                repeatsSun: true,
              },
            },
          },
        }),
      ]);

      invariant(status, "Status not found");
      invariant(result, "Item not found");

      if (result.list.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { todayEvent, lastValidDayEvent } = getRelevantEvents(
        result.list,
        result.events,
        ctx.tzOffset,
      );

      let streak = 0;

      if (lastValidDayEvent && lastValidDayEvent.status.name !== "PENDING") {
        streak = lastValidDayEvent.streak;
      }

      if (input.statusName === "COMPLETE") {
        streak++;
      }

      if (todayEvent) {
        await ctx.db
          .update(events)
          .set({
            statusId: status.id,
            shuffleChoiceId: input.shuffleChoiceId,
            streak,
          })
          .where(eq(events.id, todayEvent.id));
      } else {
        await ctx.db.insert(events).values({
          id: createId(),
          itemId: input.itemId,
          statusId: status.id,
          shuffleChoiceId: input.shuffleChoiceId,
          streak,
        });
      }
    }),
});
