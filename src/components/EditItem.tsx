import { type FormEvent, useRef, useState } from "react";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "./ResponsiveDialog";
import { EditIcon } from "./Icons";
import Button from "./Button";

type EditItemProps = {
  item: AppRouterOutputs["list"]["getAll"][0]["items"][0];
};

const EditItem = ({ item }: EditItemProps) => {
  const [title, setTitle] = useState(item.title);

  const [open, setOpenInner] = useState(false);

  const setOpen = (open: boolean) => {
    if (open) {
      setTitle(item.title);
    }

    setOpenInner(open);
  };

  const utils = api.useUtils();

  const editItem = api.item.edit.useMutation({
    onSuccess: () => setOpen(false),
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title) {
      setTitle(item.title);
    } else if (item.title !== title) {
      editItem.mutate({ id: item.id, title });
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <span
        className="w-full select-none py-1.5"
        onDoubleClick={() => setOpen(true)}
      >
        {item.title}
      </span>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button className="px-2 text-gray-400 hover:text-white" title="Edit">
            <EditIcon />
          </button>
        }
        title="Edit item"
        content={
          <form className="w-full" onSubmit={handleSubmit} tabIndex={0}>
            <input
              id={`editItemInput-${item.id}`}
              ref={ref}
              className="mb-8 w-full rounded-md border border-[#5b2da0]
                bg-[#411f72] px-2 py-1 placeholder:text-gray-400 sm:mb-6"
              type="text"
              autoComplete="off"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              onBlur={() => {
                if (!title) {
                  setTitle(item.title);
                }
              }}
              disabled={editItem.isPending}
            />

            <ResponsiveDialogFooter>
              <Button
                className="flex-1 sm:flex-none"
                type="submit"
                disabled={editItem.isPending || !open}
              >
                Save
              </Button>
              <ResponsiveDialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </ResponsiveDialogClose>
            </ResponsiveDialogFooter>
          </form>
        }
      />
    </>
  );
};

export default EditItem;
