import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import * as Collapsible from "@radix-ui/react-collapsible";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useState } from "react";
import Cookies from "universal-cookie";
import useRank from "~/hooks/useRank";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import AddItem from "./AddItem";
import DeleteList from "./DeleteList";
import EditList from "./EditList";
import { DragIndicatorIcon, ExpandLessIcon, ExpandMoreIcon } from "./Icons";
import Item from "./Item";
import { editModeAtom, editModeTransitionAtom } from "./Lists";
import Button from "./Button";
import { VisuallyHidden } from "react-aria";

type ListProps = {
  list: AppRouterOutputs["list"]["getAll"][0];
  index: number;
  collapsedLists?: Record<string, boolean>;
};

const List = ({ list, index, collapsedLists }: ListProps) => {
  const [collapsed, setCollapsed] = useState(!!collapsedLists?.[list.id]);

  const rankItem = api.item.rank.useMutation();

  const [items, handleDragEnd] = useRank(list.items, rankItem.mutate, "item");

  const editMode = useAtomValue(editModeAtom);
  const editModeTransition = useAtomValue(editModeTransitionAtom);

  const { ref, handleRef, isDragging } = useSortable({
    id: list.id,
    index,
    type: "list",
  });

  return (
    <Collapsible.Root
      open={!collapsed || editMode}
      onOpenChange={(open) => {
        const cookies = new Cookies(null, { path: "/" });

        cookies.set("collapsedLists", {
          ...cookies.get("collapsedLists"),
          [list.id]: !open,
        });

        setCollapsed(!open);
      }}
      asChild
    >
      <li
        className={clsx("relative", editModeTransition ? "py-3" : "mb-4")}
        ref={ref}
        style={{
          zIndex: isDragging ? 100 : undefined,
          viewTransitionName: `list-${list.id}`,
        }}
      >
        <div
          className={clsx(
            "mb-1 flex justify-between border-b border-gray-500 pb-1",
            !editModeTransition && "mx-2",
          )}
          style={{ viewTransitionName: `list-heading-${list.id}` }}
        >
          {editModeTransition ? (
            <>
              <button
                className={`touch-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                ref={handleRef}
              >
                <DragIndicatorIcon
                  className="w-6 pr-2"
                  width={20}
                  height={20}
                />
              </button>
              <EditList list={list} />
              <DeleteList list={list} />
            </>
          ) : (
            <>
              <span className="font-bold select-none">{list.title}</span>
              <Collapsible.Trigger asChild>
                <Button variant="icon">
                  {collapsed ? (
                    <>
                      <ExpandMoreIcon />
                      <VisuallyHidden>Expand</VisuallyHidden>
                    </>
                  ) : (
                    <>
                      <ExpandLessIcon />
                      <VisuallyHidden>Collapse</VisuallyHidden>
                    </>
                  )}
                </Button>
              </Collapsible.Trigger>
            </>
          )}
        </div>
        {editModeTransition && <AddItem listId={list.id} />}
        <Collapsible.Content asChild>
          <ul
            style={{ viewTransitionName: `items-${list.id}` }}
            className="data-[state=closed]:animate-slide-up
              data-[state=open]:animate-slide-down overflow-hidden"
          >
            <DragDropProvider onDragEnd={handleDragEnd}>
              {items.map((item, itemIndex) => (
                <Item key={item.id} item={item} index={itemIndex} />
              ))}
            </DragDropProvider>
          </ul>
        </Collapsible.Content>
      </li>
    </Collapsible.Root>
  );
};

export default List;
