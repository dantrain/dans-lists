import { createHash } from "crypto";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { items, lists, pushSubscriptions, users } from "~/server/db/schema";

const hashSubscription = (
  endpoint: string,
  p256dhKey: string,
  authKey: string,
) =>
  createHash("md5").update(`${endpoint}:${p256dhKey}:${authKey}`).digest("hex");

export const notificationRouter = createTRPCRouter({
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        notificationEnabled: true,
        notificationHour: true,
        notificationMinute: true,
      },
    });

    const userLists = await ctx.db.query.lists.findMany({
      where: eq(lists.ownerId, ctx.session.user.id),
      orderBy: [asc(lists.rank)],
      columns: { id: true, title: true },
      with: {
        items: {
          orderBy: [asc(items.rank)],
          columns: { id: true, title: true, notifyEnabled: true },
        },
      },
    });

    return {
      enabled: user?.notificationEnabled ?? false,
      hour: user?.notificationHour ?? 9,
      minute: user?.notificationMinute ?? 0,
      lists: userLists,
    };
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        hour: z.number().int().min(0).max(23),
        minute: z.number().int().min(0).max(59),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(users)
        .set({
          notificationEnabled: input.enabled,
          notificationHour: input.hour,
          notificationMinute: input.minute,
        })
        .where(eq(users.id, ctx.session.user.id)),
    ),

  updateTimezone: publicProcedure
    .input(z.object({ timeZone: z.string() }))
    .mutation(({ ctx, input }) => {
      if (!ctx.session?.user) return;

      return ctx.db
        .update(users)
        .set({ timeZone: input.timeZone })
        .where(eq(users.id, ctx.session.user.id));
    }),

  createPushSubscription: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dhKey: z.string(),
        authKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = hashSubscription(
        input.endpoint,
        input.p256dhKey,
        input.authKey,
      );

      await ctx.db
        .insert(pushSubscriptions)
        .values({
          id,
          endpoint: input.endpoint,
          p256dhKey: input.p256dhKey,
          authKey: input.authKey,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: pushSubscriptions.id,
          set: {
            endpoint: input.endpoint,
            p256dhKey: input.p256dhKey,
            authKey: input.authKey,
            userId: ctx.session.user.id,
          },
        });
    }),

  deletePushSubscription: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dhKey: z.string(),
        authKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = hashSubscription(
        input.endpoint,
        input.p256dhKey,
        input.authKey,
      );

      await ctx.db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.id, id),
            eq(pushSubscriptions.userId, ctx.session.user.id),
          ),
        );
    }),

  setItemNotify: protectedProcedure
    .input(
      z.object({
        itemId: z.string().cuid2(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.query.items.findFirst({
        where: eq(items.id, input.itemId),
        columns: {},
        with: { list: { columns: { ownerId: true } } },
      });

      if (result?.list.ownerId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db
        .update(items)
        .set({ notifyEnabled: input.enabled })
        .where(eq(items.id, input.itemId));
    }),
});
