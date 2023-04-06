import { atom, useAtom } from "jotai";
import { cloneDeep, first, isNil, set } from "lodash";
import { type NextPage } from "next";
import { Suspense, useCallback, useEffect } from "react";
import AddList from "~/components/AddList";
import Item from "~/components/Item";
import List from "~/components/List";
import Progress from "~/components/Progress";
import SettingsMenu from "~/components/SettingsMenu";

import { api, type RouterOutputs } from "~/utils/api";

export type ListData = RouterOutputs["list"]["getAll"][0];
export type ItemData = ListData["items"][0];

export const editModeAtom = atom(false);

const Home: NextPage = () => {
  return (
    <main className="relative px-4 pt-11 sm:pt-20">
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
  const timezone = "Europe/London";

  const [lists] = api.list.getAll.useSuspenseQuery(
    { timezone },
    {
      refetchInterval:
        process.env.NODE_ENV === "development" ? false : 60 * 1000,
    }
  );

  const utils = api.useContext();

  const upsertEvent = api.event.upsert.useMutation({
    onMutate: async (input) => {
      await utils.list.getAll.cancel();
      const prevData = utils.list.getAll.getData({ timezone });
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

      utils.list.getAll.setData({ timezone }, optimisticData);

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      // Roll back
      utils.list.getAll.setData({ timezone }, ctx?.prevData);
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
    <div className="mx-auto mb-10 w-full max-w-sm text-white">
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
