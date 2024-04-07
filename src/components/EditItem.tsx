import * as Collapsible from "@radix-ui/react-collapsible";
import { isEqual } from "lodash-es";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { VisuallyHidden } from "react-aria";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import Button from "./Button";
import { EditIcon } from "./Icons";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "./ResponsiveDialog";
import Switch from "./Switch";

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
          <Button variant="icon">
            <EditIcon />
            <VisuallyHidden>Edit</VisuallyHidden>
          </Button>
        }
        title="Edit item"
        content={
          <form
            className="w-full outline-none"
            onSubmit={handleSubmit}
            tabIndex={0}
          >
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

            <div className="mb-6 sm:mb-2">
              <div className="flex">
                <Switch
                  id="shuffleModeCheckbox"
                  checked={shuffleMode}
                  onCheckedChange={(checked: boolean) =>
                    setShuffleMode(checked)
                  }
                />
                <label
                  className="flex-grow select-none pl-2"
                  htmlFor={"shuffleModeCheckbox"}
                >
                  Shuffle mode
                </label>
              </div>

              <Collapsible.Root open={shuffleMode}>
                <Collapsible.Content asChild>
                  <div
                    className="overflow-hidden
                      data-[state=closed]:animate-slide-up
                      data-[state=open]:animate-slide-down"
                  >
                    <input
                      id="addShuffleChoiceInput"
                      className="mb-3 mt-4 w-full rounded-md border
                        border-[#5b2da0] bg-[#411f72] px-2 py-1
                        placeholder:text-gray-400"
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

                    <ul className="mb-2 flex flex-wrap gap-2">
                      {shuffleChoices.map((title) => (
                        <li
                          key={title}
                          className="flex rounded-md bg-violet-900 py-0.5 pl-3"
                        >
                          {title}
                          <Button
                            className="leading-[0.8]"
                            variant="icon"
                            onPress={() => {
                              setShuffleChoices(
                                shuffleChoices.filter((_) => _ !== title),
                              );
                            }}
                          >
                            ×<VisuallyHidden>Remove</VisuallyHidden>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>
            </div>

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
