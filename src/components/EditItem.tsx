import { useRef, useState } from "react";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";

type EditItemProps = {
  item: AppRouterOutputs["list"]["getAll"][0]["items"][0];
};

const EditItem = ({ item }: EditItemProps) => {
  const [title, setTitle] = useState(item.title);

  const utils = api.useUtils();

  const editItem = api.item.edit.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="my-1 w-full"
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
        className="w-full rounded-md border border-[#5b2da0] bg-[#411f72] px-2
          py-1 placeholder:text-gray-400"
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
