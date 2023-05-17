import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { atom, useAtom } from "jotai";
import { type NextPage } from "next";
import { useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import AddList from "~/components/AddList";
import { LogoIcon } from "~/components/Icons";
import List from "~/components/List";
import Progress from "~/components/Progress";
import SettingsMenu from "~/components/SettingsMenu";
import Spinner from "~/components/Spinner";
import Suspense from "~/components/Suspense";
import useRank from "~/hooks/useRank";
import { api, type RouterOutputs } from "~/utils/api";
import { getNow } from "~/utils/date";

export type ListData = RouterOutputs["list"]["getAll"][0];
export type ItemData = ListData["items"][0];

export const editModeAtom = atom(false);

const Home: NextPage = () => {
  const [cookies, setCookie] = useCookies(["tzOffset"]);

  useEffect(() => {
    const tzOffset = new Date().getTimezoneOffset().toString();

    if (cookies.tzOffset !== tzOffset) {
      setCookie("tzOffset", tzOffset);
      location.reload();
    }
  }, [cookies, setCookie]);

  return (
    <main className="relative px-4 pt-12 sm:pt-20">
      <Progress />
      <SettingsMenu />
      <Suspense
        fallback={
          <div className="flex animate-fade justify-center pt-10 text-white">
            <Spinner />
          </div>
        }
      >
        <Lists />
      </Suspense>
    </main>
  );
};

export default Home;

const Lists = () => {
  const [editMode, setEditMode] = useAtom(editModeAtom);

  const [data] = api.list.getAll.useSuspenseQuery(undefined, {
    refetchInterval: process.env.NODE_ENV === "development" ? false : 30 * 1000,
  });

  const rankList = api.list.rank.useMutation();

  const filteredData = useMemo(() => {
    const { today, minutes } = getNow();
    return data.filter(
      (list) =>
        list[`repeats${today}`] &&
        (list.startMinutes ? minutes >= list.startMinutes : true) &&
        (list.endMinutes ? minutes <= list.endMinutes : true)
    );
  }, [data]);

  const [lists, handleDragEnd] = useRank(
    editMode ? data : filteredData,
    rankList.mutate
  );

  useEffect(() => {
    if (data.length === 0 && !editMode) {
      setEditMode(true);
    }
  }, [data.length, editMode, setEditMode]);

  return (
    <div className="mx-auto mb-10 w-full max-w-sm text-white">
      {editMode && <AddList />}
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
                <List key={list.id} list={list} />
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
  );
};
