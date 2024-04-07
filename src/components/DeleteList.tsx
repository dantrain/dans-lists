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
        <Button variant="icon">
          <DeleteIcon />
          <VisuallyHidden>Delete</VisuallyHidden>
        </Button>
      }
      title={`Delete “${list.title}”`}
      description="Are you sure you want to delete this list and all its items? This cannot be undone."
      content={
        <ResponsiveDialogFooter>
          <Button
            className="flex-1 sm:flex-none"
            onPress={() => deleteList.mutate({ id: list.id })}
            disabled={deleteList.isPending || !open}
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

export default DeleteList;
