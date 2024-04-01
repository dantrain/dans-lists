import { type inferRouterOutputs } from "@trpc/server";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { itemRouter } from "./routers/item";
import { listRouter } from "./routers/list";
import { eventRouter } from "./routers/event";

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
export type AppRouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
