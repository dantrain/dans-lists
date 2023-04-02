import { type inferRouterOutputs } from "@trpc/server";
import { cloneDeep, first, isNil, set } from "lodash";
import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import { Suspense, useCallback } from "react";
import ListItem from "~/components/ListItem";
import Progress from "~/components/Progress";
import { type AppRouter } from "~/server/api/root";

import { api } from "~/utils/api";

export type Item =
  inferRouterOutputs<AppRouter>["example"]["getLists"][0]["items"][0];

const Home: NextPage = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20">
      <Progress />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Dan&apos;s Lists
        </h1>
        <Suspense fallback={<></>}>
          <Lists />
        </Suspense>
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    </main>
  );
};

export default Home;

const Lists = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [lists] = api.example.getLists.useSuspenseQuery({ timezone });

  const utils = api.useContext();

  const upsertEvent = api.example.upsertEvent.useMutation({
    onMutate: async (input) => {
      await utils.example.getLists.cancel();
      const prevData = utils.example.getLists.getData({ timezone });
      const optimisticData = cloneDeep(prevData);

      let itemIndex;
      const listIndex = optimisticData?.findIndex((list) => {
        itemIndex = list.items.findIndex((item) => item.id === input.itemId);
        return itemIndex >= 0;
      });

      if (
        !isNil(optimisticData) &&
        !isNil(listIndex) &&
        !isNil(itemIndex) &&
        itemIndex >= 0
      ) {
        set(
          optimisticData,
          [listIndex, "items", itemIndex, "events", "0", "status", "name"],
          input.statusName
        );
      }

      utils.example.getLists.setData({ timezone }, optimisticData);

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      // Roll back
      utils.example.getLists.setData({ timezone }, ctx?.prevData);
    },
  });

  const handleCheckedChanged = useCallback(
    ({ id, events }: Item) => {
      upsertEvent.mutate({
        timezone,
        itemId: id,
        statusName:
          first(events)?.status.name === "COMPLETE" ? "PENDING" : "COMPLETE",
      });
    },
    [timezone, upsertEvent]
  );

  const deleteEvents = api.example.deleteEvents.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  return (
    <>
      <ul className="list-disc text-white">
        {lists.map(({ id, title, items }) => (
          <li key={id} className="mb-5">
            <div className="mb-2">{title}</div>
            <ul className="ml-4">
              {items.map((item) => (
                <ListItem
                  key={item.id}
                  item={item}
                  onCheckedChange={handleCheckedChanged}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => deleteEvents.mutate()}
      >
        Delete events
      </button>
    </>
  );
};
