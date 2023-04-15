import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import useRank from "~/hooks/useRank";
import { editModeAtom, type ListData } from "~/pages";
import { api } from "~/utils/api";
import AddItem from "./AddItem";
import EditList from "./EditList";
import EditListRepeat from "./EditListRepeat";
import {
  DeleteIcon,
  DragIndicatorIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
} from "./Icons";
import Item from "./Item";

type ListProps = {
  list: ListData;
};

const List = ({ list }: ListProps) => {
  const [open, setOpen] = useLocalStorage(`list-${list.id}-open`, true);

  const utils = api.useContext();

  const deleteList = api.list.delete.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const rankItem = api.item.rank.useMutation();

  const [items, handleDragEnd] = useRank(list.items, rankItem.mutate);

  const editMode = useAtomValue(editModeAtom);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  return (
    <Collapsible.Root open={open || editMode} onOpenChange={setOpen} asChild>
      <li
        className="relative mb-5"
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
          zIndex: isDragging ? 100 : undefined,
        }}
      >
        <div className="mx-2 mb-2 flex justify-between border-b border-gray-500 pb-1">
          {editMode ? (
            <>
              <button
                className={`touch-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
              >
                <DragIndicatorIcon
                  className="w-6 pr-2"
                  width={20}
                  height={20}
                />
              </button>
              <EditList list={list} />
              <button
                className="px-2 text-gray-400 hover:text-white"
                title="Delete"
                onClick={() => deleteList.mutate({ id: list.id })}
              >
                <DeleteIcon />
              </button>
            </>
          ) : (
            <>
              <span className="select-none font-bold">{list.title}</span>
              <Collapsible.Trigger asChild>
                <button
                  className="px-2 text-gray-400 hover:text-white"
                  title={open ? "Collapse" : "Expand"}
                >
                  {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </button>
              </Collapsible.Trigger>
            </>
          )}
        </div>
        {editMode && (
          <>
            <EditListRepeat list={list} />
            <AddItem listId={list.id} />
          </>
        )}
        <Collapsible.Content asChild>
          <ul className="mx-1">
            <DndContext
              id={list.id}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <Item key={item.id} item={item} />
                ))}
              </SortableContext>
            </DndContext>
          </ul>
        </Collapsible.Content>
      </li>
    </Collapsible.Root>
  );
};

export default List;
