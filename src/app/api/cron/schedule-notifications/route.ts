import { Client } from "@upstash/qstash";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, isNotNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const qstash = new Client({ token: env.QSTASH_TOKEN });

  const enabledUsers = await db.query.users.findMany({
    where: and(eq(users.notificationEnabled, true), isNotNull(users.timeZone)),
    columns: {
      id: true,
      notificationHour: true,
      notificationMinute: true,
      timeZone: true,
    },
  });

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.NEXTAUTH_URL;

  const results = await Promise.allSettled(
    enabledUsers.map((user) => {
      const now = dayjs().tz(user.timeZone!);
      let notifyTime = now
        .hour(user.notificationHour)
        .minute(user.notificationMinute)
        .second(0)
        .millisecond(0);

      // If the notification time has already passed today, schedule for tomorrow
      if (notifyTime.isBefore(now)) {
        notifyTime = notifyTime.add(1, "day");
      }

      return qstash.publishJSON({
        url: `${baseUrl}/api/cron/send-notification`,
        body: { userId: user.id },
        notBefore: notifyTime.unix(),
      });
    }),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    scheduled: succeeded,
    failed,
    total: enabledUsers.length,
  });
}
