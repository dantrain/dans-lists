import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { events, items, statuses } from "~/server/db/schema";
import { getRelevantEvents } from "../utils";
import invariant from "tiny-invariant";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";

export const eventRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid2(),
        statusName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [status, result] = await Promise.all([
        ctx.db.query.statuses.findFirst({
          where: eq(statuses.name, input.statusName),
        }),
        ctx.db.query.items.findFirst({
          where: eq(items.id, input.itemId),
          columns: {},
          with: {
            events: {
              // TODO: where
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
        0, // TODO: ctx.tzOffset,
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
            streak,
          })
          .where(eq(events.id, todayEvent.id));
      } else {
        await ctx.db.insert(events).values({
          id: createId(),
          itemId: input.itemId,
          statusId: status.id,
          streak,
        });
      }
    }),
});
