"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { atom, useAtom } from "jotai";
import { createContext, useEffect, useMemo } from "react";
import { LogoIcon } from "~/components/Icons";
import useRank from "~/hooks/useRank";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import { getNow } from "~/utils/date";
import AddList from "./AddList";
import List from "./List";

export const editModeAtom = atom(false);
export const editModeTransitionAtom = atom(false);

export const editModeSetterAtom = atom(null, (_get, set, update: boolean) => {
  set(editModeAtom, update);

  if (document.startViewTransition) {
    requestAnimationFrame(() => {
      document.startViewTransition(async () =>
        set(editModeTransitionAtom, update),
      );
    });
  } else {
    set(editModeTransitionAtom, update);
  }
});

export const TzOffsetContext = createContext(0);

type ListsProps = {
  initialData: AppRouterOutputs["list"]["getAll"];
  tzOffset: number;
  collapsedLists?: Record<string, boolean>;
};

export default function Lists({
  initialData,
  tzOffset,
  collapsedLists,
}: ListsProps) {
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const [editModeTransition, setEditModeTransition] = useAtom(
    editModeTransitionAtom,
  );

  const { data } = api.list.getAll.useQuery(undefined, {
    initialData,
    staleTime: 1000,
    refetchInterval: process.env.NODE_ENV === "development" ? false : 30 * 1000,
  });

  const rankList = api.list.rank.useMutation();

  const filteredData = useMemo(() => {
    const { today, minutes } = getNow(tzOffset);
    return data.filter(
      (list) =>
        list[`repeats${today}`] &&
        (list.startMinutes ? minutes >= list.startMinutes : true) &&
        (list.endMinutes ? minutes <= list.endMinutes : true),
    );
  }, [data, tzOffset]);

  const [lists, handleDragEnd] = useRank(
    editMode ? data : filteredData,
    rankList.mutate,
  );

  useEffect(() => {
    if (data.length === 0 && !editMode) {
      setEditMode(true);
      setEditModeTransition(true);
    }
  }, [data.length, editMode, setEditMode, setEditModeTransition]);

  return (
    <TzOffsetContext.Provider value={tzOffset}>
      <div className="mx-auto mb-10 w-full max-w-sm">
        {editModeTransition && <AddList />}
        {lists.length ? (
          <ul>
            <DndContext
              id="lists"
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lists}
                strategy={verticalListSortingStrategy}
              >
                {lists.map((list) => (
                  <List
                    key={list.id}
                    list={list}
                    collapsedLists={collapsedLists}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </ul>
        ) : (
          <div className="flex justify-center pt-14 text-white/25">
            <LogoIcon width="100" height="100" />
          </div>
        )}
      </div>
    </TzOffsetContext.Provider>
  );
}
