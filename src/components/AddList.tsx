import { useRef } from "react";
import { api } from "~/utils/api";

const AddList = () => {
  const utils = api.useContext();

  const createList = api.example.createList.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const title = ref.current?.value.trim();

        if (title) {
          createList.mutate({ title });
        }

        if (ref.current) ref.current.value = "";
      }}
    >
      <input
        id="addListInput"
        ref={ref}
        className="mb-4 w-full rounded-md border border-[hsl(264,56%,40%)] bg-white/10 px-2 py-1 placeholder:text-gray-400"
        type="text"
        placeholder="Add a list"
        autoComplete="off"
      />
    </form>
  );
};

export default AddList;
