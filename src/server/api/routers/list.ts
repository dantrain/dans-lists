import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getNextRank,
  getRankBetween,
  getRelevantEvents,
  getWeekDateRange,
} from "../utils";
import { events, items, lists, shuffleChoices } from "~/server/db/schema";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { isNull, omit } from "lodash-es";
import { daysOfWeek } from "~/utils/date";

export const listRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const range = getWeekDateRange(ctx.tzOffset);

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
            shuffleMode: true,
          },
          with: {
            shuffleChoices: {
              where: eq(shuffleChoices.isDeleted, false),
              orderBy: [asc(shuffleChoices.createdAt)],
            },
            events: {
              where: and(
                gte(lists.createdAt, new Date(range.gte)),
                lt(lists.createdAt, new Date(range.lt)),
              ),
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
            ctx.tzOffset,
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
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [beforeItem] = await ctx.db
        .select({ rank: lists.rank })
        .from(lists)
        .orderBy(desc(lists.rank))
        .limit(1);

      return ctx.db.insert(lists).values({
        id: createId(),
        title: input.title,
        rank: getNextRank(beforeItem),
        ownerId: ctx.session.user.id,
      });
    }),

  edit: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid2(),
          title: z.string().min(1),
          startMinutes: z.nullable(z.number().int().gte(0).lte(1440)),
          endMinutes: z.nullable(z.number().int().gte(0).lte(1440)),
          repeatDays: z.array(z.enum(daysOfWeek)),
        })
        .refine(
          (_) =>
            isNull(_.startMinutes) ||
            isNull(_.endMinutes) ||
            _.startMinutes <= _.endMinutes,
        ),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(lists)
        .set({
          title: input.title,
          startMinutes: input.startMinutes,
          endMinutes: input.endMinutes,
          ...daysOfWeek.reduce(
            (data, day) => ({
              ...data,
              [`repeats${day}`]: input.repeatDays.includes(day),
            }),
            {},
          ),
        })
        .where(
          and(eq(lists.id, input.id), eq(lists.ownerId, ctx.session.user.id)),
        ),
    ),

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
      const [beforeItem, afterItem] = await Promise.all([
        input.beforeId
          ? ctx.db.query.lists.findFirst({
              where: eq(lists.id, input.beforeId),
            })
          : null,
        input.afterId
          ? ctx.db.query.lists.findFirst({
              where: eq(lists.id, input.afterId),
            })
          : null,
      ]);

      return ctx.db
        .update(lists)
        .set({ rank: getRankBetween(beforeItem, afterItem) })
        .where(
          and(eq(lists.id, input.id), eq(lists.ownerId, ctx.session.user.id)),
        );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(lists)
        .where(
          and(eq(lists.id, input.id), eq(lists.ownerId, ctx.session.user.id)),
        ),
    ),
});
