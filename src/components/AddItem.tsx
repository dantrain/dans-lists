import { useRef } from "react";
import { api } from "~/utils/api";

const AddItem = ({ listId }: { listId: string }) => {
  const utils = api.useContext();

  const createItem = api.item.create.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const title = ref.current?.value.trim();

        if (title) {
          createItem.mutate({ title, listId });
        }

        if (ref.current) ref.current.value = "";
      }}
    >
      <input
        id={`addItemInput-${listId}`}
        ref={ref}
        className="mb-2 mt-2 w-full rounded-md border border-[#5b2da0] bg-[#411f72] px-2 py-1 placeholder:text-gray-400"
        type="text"
        placeholder="Add an item"
        autoComplete="off"
      />
    </form>
  );
};

export default AddItem;
