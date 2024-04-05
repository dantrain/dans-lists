import { api } from "~/trpc/react";
import { DeleteIcon } from "./Icons";
import { type AppRouterOutputs } from "~/server/api/root";
import { useState } from "react";
import { ResponsiveDialog } from "./ResponsiveDialog";
import Button from "./Button";

type DeleteListProps = {
  list: AppRouterOutputs["list"]["getAll"][0];
};

const DeleteList = ({ list }: DeleteListProps) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const deleteList = api.list.delete.useMutation({
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
      title="Delete list"
      description="Are you sure you want to delete this list and all its items? This cannot be undone."
      content={
        <div className="flex sm:justify-end">
          <Button
            className="flex-1 sm:flex-none"
            onPress={() => deleteList.mutate({ id: list.id })}
            disabled={deleteList.isPending || !open}
          >
            Delete
          </Button>
        </div>
      }
    />
  );
};

export default DeleteList;
