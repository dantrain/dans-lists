import { isEqual } from "lodash-es";
import { useRef, useState, type FormEvent, useMemo } from "react";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import { EditIcon } from "./Icons";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "./ResponsiveDialog";

type EditItemProps = {
  item: AppRouterOutputs["list"]["getAll"][0]["items"][0];
};

const EditItem = ({ item }: EditItemProps) => {
  const initialShuffleChoices = useMemo(
    () => item.shuffleChoices.map((_) => _.title),
    [item],
  );

  const [title, setTitle] = useState(item.title);
  const [shuffleMode, setShuffleMode] = useState(item.shuffleMode);
  const [shuffleChoices, setShuffleChoices] = useState(initialShuffleChoices);

  const [open, setOpenInner] = useState(false);

  const setOpen = (open: boolean) => {
    if (open) {
      setTitle(item.title);
      setShuffleMode(item.shuffleMode);
      setShuffleChoices(initialShuffleChoices);
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
    } else if (
      !isEqual(
        {
          title: item.title,
          shuffleMode: item.shuffleMode,
          shuffleChoices: initialShuffleChoices,
        },
        { title, shuffleMode, shuffleChoices },
      )
    ) {
      editItem.mutate({ id: item.id, title, shuffleMode, shuffleChoices });
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
              className="mb-4 w-full rounded-md border border-[#5b2da0]
                bg-[#411f72] px-2 py-1 placeholder:text-gray-400"
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

            <div className="mb-2 flex">
              <Checkbox
                id="shuffleModeCheckbox"
                checked={shuffleMode}
                onCheckedChange={(checked: boolean) => setShuffleMode(checked)}
              />
              <label
                className="flex-grow select-none pl-1"
                htmlFor={"shuffleModeCheckbox"}
              >
                Shuffle mode
              </label>
            </div>

            {shuffleMode ? (
              <div className="mb-6 mt-2">
                <input
                  id="addShuffleChoiceInput"
                  className="mb-3 w-full rounded-md border border-[#5b2da0]
                    bg-[#411f72] px-2 py-1 placeholder:text-gray-400"
                  type="text"
                  placeholder="Add a choice"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const inputElement = e.target as HTMLInputElement;

                      if (
                        inputElement.value &&
                        !shuffleChoices.includes(inputElement.value)
                      ) {
                        setShuffleChoices([
                          ...shuffleChoices,
                          inputElement.value,
                        ]);
                      }

                      inputElement.value = "";
                    }
                  }}
                />

                <ul className="flex flex-wrap gap-2">
                  {shuffleChoices.map((title) => (
                    <li
                      key={title}
                      className="flex rounded-md bg-violet-900 py-0.5 pl-3"
                    >
                      {title}
                      <button
                        className="px-2 leading-[0.8] text-gray-400
                          hover:text-white"
                        title="Delete"
                        onClick={() => {
                          setShuffleChoices(
                            shuffleChoices.filter((_) => _ !== title),
                          );
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
