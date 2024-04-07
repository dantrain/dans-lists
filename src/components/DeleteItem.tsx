import { api } from "~/trpc/react";
import { DeleteIcon } from "./Icons";
import { type AppRouterOutputs } from "~/server/api/root";
import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "./ResponsiveDialog";
import Button from "./Button";
import { VisuallyHidden } from "react-aria";

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
        <Button variant="icon">
          <DeleteIcon />
          <VisuallyHidden>Delete</VisuallyHidden>
        </Button>
      }
      title={`Delete “${item.title}”`}
      description="Are you sure?"
      content={
        <ResponsiveDialogFooter>
          <Button
            className="flex-1 sm:flex-none"
            onPress={() => deleteItem.mutate({ id: item.id })}
            disabled={deleteItem.isPending || !open}
          >
            Delete
          </Button>
          <ResponsiveDialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      }
    />
  );
};

export default DeleteItem;
