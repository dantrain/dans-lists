import { type inferRouterOutputs } from "@trpc/server";
import { cloneDeep, first, isNil, set } from "lodash";
import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import { FormEvent, Suspense, useCallback } from "react";
import AddList from "~/components/AddList";
import ListItem from "~/components/ListItem";
import Progress from "~/components/Progress";
import { type AppRouter } from "~/server/api/root";

import { api } from "~/utils/api";

export type Item =
  inferRouterOutputs<AppRouter>["example"]["getLists"][0]["items"][0];

const Home: NextPage = () => {
  const utils = api.useContext();

  const deleteEvents = api.example.deleteEvents.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20">
      <Progress />
      <Suspense fallback={<></>}>
        <Lists />
      </Suspense>
      <div className="flex gap-4">
        <button
          className="rounded-lg bg-white/10 px-5 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => deleteEvents.mutate()}
        >
          Delete events
        </button>
        <button
          className="rounded-lg bg-white/10 px-5 py-2 font-semibold text-white no-underline transition hover:bg-white/20"
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

  return (
    <div className="mb-10 w-full max-w-sm text-white">
      <AddList />
      <ul className="px-2">
        {lists.map(({ id, title, items }) => (
          <li key={id} className="mb-5">
            <div className="mb-2 select-none border-b border-gray-500 pb-1 font-bold">
              {title}
            </div>
            <ul>
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
    </div>
  );
};
