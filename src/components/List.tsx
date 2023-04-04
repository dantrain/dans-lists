import { useAtomValue } from "jotai";
import { type ReactNode } from "react";
import { editModeAtom, type ListData } from "~/pages";
import { api } from "~/utils/api";
import AddItem from "./AddItem";
import { DeleteIcon } from "./Icons";

type ListProps = {
  list: ListData;
  children: ReactNode;
};

const List = ({ list: { title, id }, children }: ListProps) => {
  const utils = api.useContext();

  const deleteList = api.list.delete.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const editMode = useAtomValue(editModeAtom);

  return (
    <li className="mb-5">
      <div className="mx-2 mb-2 flex justify-between border-b border-gray-500 pb-1">
        <span className="select-none font-bold">{title}</span>
        {editMode && (
          <button
            className="px-2 text-gray-400 hover:text-white"
            title="Delete"
            onClick={() => deleteList.mutate({ id })}
          >
            <DeleteIcon />
          </button>
        )}
      </div>
      {editMode && <AddItem listId={id} />}
      <ul className="mx-1">{children}</ul>
    </li>
  );
};

export default List;
