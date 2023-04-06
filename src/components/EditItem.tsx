import { useRef, useState } from "react";
import { type ItemData } from "~/pages";
import { api } from "~/utils/api";

const EditItem = ({ item }: { item: ItemData }) => {
  const [title, setTitle] = useState(item.title);

  const utils = api.useContext();

  const editItem = api.item.edit.useMutation({
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
        if (title && title !== item.title) {
          editItem.mutate({ id: item.id, title });
        }
      }}
    >
      <input
        id={`editItemInput-${item.id}`}
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

export default EditItem;
