import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { atom, useAtom } from "jotai";
import { findIndex } from "lodash";
import { type NextPage } from "next";
import { Suspense, useEffect, useState } from "react";
import AddList from "~/components/AddList";
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
  const [data] = api.list.getAll.useSuspenseQuery(undefined, {
    refetchInterval: process.env.NODE_ENV === "development" ? false : 60 * 1000,
  });

  const [lists, setLists] = useState(data);

  useEffect(() => {
    setLists(data);
  }, [data]);

  const rankList = api.list.rank.useMutation();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLists((lists) => {
        const oldIndex = findIndex(lists, { id: active.id as string });
        const newIndex = findIndex(lists, { id: over.id as string });

        const newItems = arrayMove(lists, oldIndex, newIndex);

        rankList.mutate(
          {
            id: active.id as string,
            beforeId: newItems[newIndex - 1]?.id,
            afterId: newItems[newIndex + 1]?.id,
          },
          {
            onError: () => {
              setLists(data);
            },
          }
        );

        return newItems;
      });
    }
  };

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
