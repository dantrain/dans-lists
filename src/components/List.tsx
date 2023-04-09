import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAtomValue } from "jotai";
import { editModeAtom, type ListData } from "~/pages";
import { api } from "~/utils/api";
import AddItem from "./AddItem";
import EditList from "./EditList";
import { DeleteIcon } from "./Icons";
import Item from "./Item";

type ListProps = {
  list: ListData;
};

const List = ({ list }: ListProps) => {
  const utils = api.useContext();

  const deleteList = api.list.delete.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const editMode = useAtomValue(editModeAtom);

  return (
    <li className="mb-5">
      <div className="mx-2 mb-2 flex justify-between border-b border-gray-500 pb-1">
        {editMode ? (
          <>
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
          <span className="select-none font-bold">{list.title}</span>
        )}
      </div>
      {editMode && <AddItem listId={list.id} />}
      <ul className="mx-1">
        <DndContext id={list.id} collisionDetection={closestCenter}>
          <SortableContext
            items={list.items}
            strategy={verticalListSortingStrategy}
          >
            {list.items.map((item) => (
              <Item key={item.id} item={item} />
            ))}
          </SortableContext>
        </DndContext>
      </ul>
    </li>
  );
};

export default List;
