import { type inferRouterOutputs } from "@trpc/server";
import { atom, useAtom } from "jotai";
import { cloneDeep, first, isNil, set } from "lodash";
import { type NextPage } from "next";
import { Suspense, useCallback, useEffect } from "react";
import AddList from "~/components/AddList";
import Item from "~/components/Item";
import List from "~/components/List";
import Progress from "~/components/Progress";
import SettingsMenu from "~/components/SettingsMenu";
import { type AppRouter } from "~/server/api/root";

import { api } from "~/utils/api";

export type ListData = inferRouterOutputs<AppRouter>["example"]["getLists"][0];
export type ItemData = ListData["items"][0];

export const editModeAtom = atom(false);

const Home: NextPage = () => {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-20">
      <Progress />
      <SettingsMenu />
      <Suspense fallback={<></>}>
        <Lists />
      </Suspense>
    </main>
  );
};

export default Home;

const Lists = () => {
  // const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const timezone = "Europe/London";

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
    ({ id, events }: ItemData) => {
      upsertEvent.mutate({
        timezone,
        itemId: id,
        statusName:
          first(events)?.status.name === "COMPLETE" ? "PENDING" : "COMPLETE",
      });
    },
    [timezone, upsertEvent]
  );

  const [editMode, setEditMode] = useAtom(editModeAtom);

  useEffect(() => {
    if (lists && lists.length === 0 && !editMode) {
      setEditMode(true);
    }
  }, [editMode, lists, setEditMode]);

  return (
    <div className="mb-10 w-full max-w-sm text-white">
      {editMode && <AddList />}
      <ul>
        {lists.map((list) => (
          <List key={list.id} list={list}>
            {list.items.map((item) => (
              <Item
                key={item.id}
                item={item}
                onCheckedChange={handleCheckedChanged}
              />
            ))}
          </List>
        ))}
      </ul>
    </div>
  );
};
