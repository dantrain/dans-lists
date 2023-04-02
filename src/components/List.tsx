import { type ReactNode } from "react";
import { type ListData } from "~/pages";
import { api } from "~/utils/api";
import AddItem from "./AddItem";

const DeleteIcon = () => (
  <svg
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

type ListProps = {
  list: ListData;
  children: ReactNode;
};

const List = ({ list: { title, id }, children }: ListProps) => {
  const utils = api.useContext();

  const deleteList = api.example.deleteList.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  return (
    <li className="mb-5">
      <div className="group mx-2 mb-2 flex justify-between border-b border-gray-500 pb-1">
        <span className="select-none font-bold">{title}</span>
        <button
          className="invisible px-2 text-gray-400 hover:text-white group-hover:visible"
          title="Delete"
          onClick={() => deleteList.mutate({ id })}
        >
          <DeleteIcon />
        </button>
      </div>
      <AddItem listId={id} />
      <ul className="mx-2">{children}</ul>
    </li>
  );
};

export default List;
