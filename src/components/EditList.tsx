import { useRef, useState } from "react";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";

type EditListProps = {
  list: AppRouterOutputs["list"]["getAll"][0];
};

const EditList = ({ list }: EditListProps) => {
  const utils = api.useUtils();
  const [title, setTitle] = useState(list.title);

  const editList = api.list.edit.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="mb-1 w-full"
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

export default EditList;
