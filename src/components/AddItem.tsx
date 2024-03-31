import { useRouter } from "next/navigation";
import { useRef } from "react";
import { api } from "~/trpc/react";

const AddItem = ({ listId }: { listId: string }) => {
  const router = useRouter();

  const createItem = api.item.create.useMutation({
    onSettled: () => router.refresh(),
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="my-2"
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
        className="w-full rounded-md border border-[#5b2da0] bg-[#411f72] px-2
          py-1 placeholder:text-gray-400"
        type="text"
        placeholder="Add an item"
        autoComplete="off"
      />
    </form>
  );
};

export default AddItem;
