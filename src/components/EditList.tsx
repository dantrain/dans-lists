import { useRef, useState } from "react";
import { type ListData } from "~/pages";
import { api } from "~/utils/api";

const EditList = ({ list }: { list: ListData }) => {
  const [title, setTitle] = useState(list.title);

  const utils = api.useContext();

  const editList = api.list.edit.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        ref.current?.blur();
      }}
      onBlur={() => {
        if (title && title !== list.title) {
          editList.mutate({ id: list.id, title });
        }
      }}
    >
      <input
        id={`editListInput-${list.id}`}
        ref={ref}
        className="w-full rounded-md border border-[hsl(264,56%,40%)] bg-white/10 px-2 py-1 placeholder:text-gray-400"
        type="text"
        autoComplete="off"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
    </form>
  );
};

export default EditList;
