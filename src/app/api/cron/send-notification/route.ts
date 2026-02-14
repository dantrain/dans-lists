import { Receiver } from "@upstash/qstash";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import PQueue from "p-queue";
import webpush from "web-push";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  events,
  items,
  lists,
  pushSubscriptions,
  users,
} from "~/server/db/schema";
import { daysOfWeek } from "~/utils/date";

dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(timezone);

export async function POST(request: NextRequest) {
  const receiver = new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  });

  const body = await request.text();
  const signature = request.headers.get("upstash-signature") ?? "";

  try {
    await receiver.verify({
      signature,
      body,
      url: request.url,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { userId } = JSON.parse(body) as { userId: string };

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      notificationEnabled: true,
      timeZone: true,
    },
  });

  if (!user?.notificationEnabled || !user.timeZone) {
    return NextResponse.json({ message: "Notifications disabled" });
  }

  const tz = user.timeZone;
  const now = dayjs().tz(tz);
  const todayStart = now.startOf("day").toDate();
  const todayEnd = now.endOf("day").toDate();
  const todayIndex = now.isoWeekday() - 1;
  const todayDay = daysOfWeek[todayIndex]!;

  // Get all lists owned by this user that repeat today
  const userLists = await db.query.lists.findMany({
    where: and(
      eq(lists.ownerId, userId),
      eq(lists[`repeats${todayDay}`], true),
    ),
    columns: { id: true, title: true },
    with: {
      items: {
        where: eq(items.notifyEnabled, true),
        orderBy: [asc(items.rank)],
        columns: { id: true, title: true },
        with: {
          events: {
            where: and(
              gte(events.createdAt, todayStart),
              lt(events.createdAt, todayEnd),
            ),
            limit: 1,
            with: {
              status: { columns: { name: true } },
            },
          },
        },
      },
    },
  });

  // Filter to items that are incomplete today
  const incompleteItems = userLists.flatMap((list) =>
    list.items
      .filter((item) => {
        const todayEvent = item.events[0];

        return !todayEvent || todayEvent.status.name === "PENDING";
      })
      .map((item) => item.title),
  );

  if (incompleteItems.length === 0) {
    return NextResponse.json({ message: "All items complete" });
  }

  // Build notification payload
  const payload = JSON.stringify({
    title: "Items remaining",
    options: {
      body: incompleteItems.join(", "),
    },
  });

  // Get all push subscriptions for this user
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });

  const queue = new PQueue({ concurrency: 4 });

  await queue.addAll(
    subscriptions.map((sub) => async () => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
          },
          payload,
          {
            vapidDetails: {
              subject: "mailto:dan@dantrain.dev",
              publicKey: env.VAPID_PUBLIC_KEY,
              privateKey: env.VAPID_PRIVATE_KEY,
            },
            TTL: 43200,
          },
        );
      } catch (e: unknown) {
        const err = e as { statusCode?: number };

        if (err.statusCode === 404 || err.statusCode === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error("Push notification error:", e);
        }
      }
    }),
  );

  return NextResponse.json({
    sent: subscriptions.length,
    items: incompleteItems.length,
  });
}
