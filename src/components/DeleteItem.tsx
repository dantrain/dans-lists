import { api } from "~/trpc/react";
import { DeleteIcon } from "./Icons";
import { type AppRouterOutputs } from "~/server/api/root";
import { useState } from "react";
import ResponsiveDialog from "./ResponsiveDialog";

type DeleteItemProps = {
  item: AppRouterOutputs["list"]["getAll"][0]["items"][0];
};

const DeleteItem = ({ item }: DeleteItemProps) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const deleteItem = api.item.delete.useMutation({
    onSuccess: () => setOpen(false),
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button className="px-2 text-gray-400 hover:text-white" title="Delete">
          <DeleteIcon />
        </button>
      }
      title="Delete item"
      description="Are you sure?"
      content={
        <button
          className="w-full rounded-md border-violet-500 bg-violet-900 px-2 py-1
            text-violet-100 disabled:opacity-60"
          type="button"
          onClick={() => deleteItem.mutate({ id: item.id })}
          disabled={deleteItem.isPending}
        >
          Delete
        </button>
      }
    />
  );
};

export default DeleteItem;
