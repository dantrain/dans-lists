import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { atom, useAtom } from "jotai";
import { type NextPage } from "next";
import { Suspense, useEffect } from "react";
import AddList from "~/components/AddList";
import List from "~/components/List";
import Progress from "~/components/Progress";
import SettingsMenu from "~/components/SettingsMenu";
import useRank from "~/hooks/useRank";

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
  const [data] = api.list.getAll.useSuspenseQuery(undefined, {
    refetchInterval: process.env.NODE_ENV === "development" ? false : 60 * 1000,
  });

  const rankList = api.list.rank.useMutation();

  const [lists, handleDragEnd] = useRank(data, rankList.mutate);

  const [editMode, setEditMode] = useAtom(editModeAtom);

  useEffect(() => {
    if (lists.length === 0 && !editMode) {
      setEditMode(true);
    }
  }, [editMode, lists, setEditMode]);

  return (
    <div className="mx-auto mb-10 w-full max-w-sm text-white">
      {editMode && <AddList />}
      <ul>
        <DndContext
          id="lists"
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={lists} strategy={verticalListSortingStrategy}>
            {lists.map((list) => (
              <List key={list.id} list={list} />
            ))}
          </SortableContext>
        </DndContext>
      </ul>
    </div>
  );
};
