import { createTRPCRouter } from "~/server/api/trpc";
import { eventRouter } from "./routers/event";
import { itemRouter } from "./routers/item";
import { listRouter } from "./routers/list";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  list: listRouter,
  item: itemRouter,
  event: eventRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
