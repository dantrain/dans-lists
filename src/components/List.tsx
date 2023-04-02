import { type ReactNode } from "react";
import { type ListData } from "~/pages";
import { api } from "~/utils/api";

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
      <div className="group mb-2 flex justify-between border-b border-gray-500 pb-1">
        <span className="select-none font-bold">{title}</span>
        <button
          className="invisible px-2 group-hover:visible"
          onClick={() => deleteList.mutate({ id })}
        >
          Delete
        </button>
      </div>
      <ul>{children}</ul>
    </li>
  );
};

export default List;
