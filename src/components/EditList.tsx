import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { isEqual, isNull, padStart, range } from "lodash-es";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type SelectHTMLAttributes,
} from "react";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import { daysOfWeek, type Weekday } from "~/utils/date";
import { EditIcon } from "./Icons";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "./ResponsiveDialog";
import Button from "./Button";
import { VisuallyHidden } from "react-aria";

const TimeRangeSelect = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className="rounded-md border border-[#5b2da0] bg-[#411f72] px-2 py-1"
    {...props}
  >
    <option value="">-</option>
    {range(96).map((_) => (
      <option key={_} value={_ * 15}>
        {((_ / 4) | 0) % 12 || 12}:{padStart(((_ % 4) * 15).toString(), 2, "0")}
        {(_ / 48) | 0 ? "pm" : "am"}
      </option>
    ))}
  </select>
);

type EditListProps = {
  list: AppRouterOutputs["list"]["getAll"][0];
};

const EditList = ({ list }: EditListProps) => {
  const initialRepeatDays = useMemo(
    () => daysOfWeek.filter((weekday) => list[`repeats${weekday}`]),
    [list],
  );

  const [title, setTitle] = useState(list.title);
  const [repeatDays, setRepeatDays] = useState(initialRepeatDays);
  const [startMinutes, setStartMinutes] = useState(list.startMinutes);
  const [endMinutes, setEndMinutes] = useState(list.endMinutes);

  const [open, setOpenInner] = useState(false);

  const setOpen = (open: boolean) => {
    if (open) {
      setTitle(list.title);
      setRepeatDays(initialRepeatDays);
      setStartMinutes(list.startMinutes);
      setEndMinutes(list.endMinutes);
    }

    setOpenInner(open);
  };

  const utils = api.useUtils();

  const editList = api.list.edit.useMutation({
    onSuccess: () => setOpen(false),
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title) {
      setTitle(list.title);
    } else if (
      !isEqual(
        {
          title: list.title,
          repeatDays: initialRepeatDays,
          startMinutes: list.startMinutes,
          endMinutes: list.endMinutes,
        },
        { title, repeatDays, startMinutes, endMinutes },
      )
    ) {
      editList.mutate({
        id: list.id,
        title,
        repeatDays,
        startMinutes,
        endMinutes,
      });
    } else {
      setOpen(false);
    }
  };

  return (
    <>
      <span
        className="w-full select-none font-bold"
        onDoubleClick={() => setOpen(true)}
      >
        {list.title}
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
        title="Edit list"
        content={
          <form
            className="w-full outline-none"
            onSubmit={handleSubmit}
            tabIndex={0}
          >
            <input
              id={`editListInput-${list.id}`}
              ref={ref}
              className="mb-8 w-full rounded-md border border-[#5b2da0]
                bg-[#411f72] px-2 py-1 placeholder:text-gray-400"
              type="text"
              autoComplete="off"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              onBlur={() => {
                if (!title) {
                  setTitle(list.title);
                }
              }}
              disabled={editList.isPending}
            />

            <ToggleGroup.Root
              className="mb-4 grid grid-cols-7 overflow-hidden rounded-md border
                border-violet-500"
              type="multiple"
              value={repeatDays}
              onValueChange={(value: Weekday[]) => setRepeatDays(value)}
              disabled={editList.isPending}
            >
              {daysOfWeek.map((_) => (
                <ToggleGroup.Item
                  key={_}
                  className="border-r border-violet-500 py-1 text-center
                    text-violet-300 last:border-r-0
                    data-[state=on]:bg-violet-900 data-[state=on]:text-white"
                  value={_}
                >
                  {_}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>

            <div className="mb-8 flex justify-center gap-2">
              <TimeRangeSelect
                value={startMinutes ?? ""}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value, 10);
                  setStartMinutes(Number.isNaN(minutes) ? null : minutes);
                  setEndMinutes(
                    isNull(endMinutes) || endMinutes <= minutes
                      ? null
                      : endMinutes,
                  );
                }}
              />
              <span className="leading-7">&#8211;</span>
              <TimeRangeSelect
                className="rounded-md border border-[#5b2da0] bg-[#411f72] px-2
                  py-1"
                value={endMinutes ?? ""}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value, 10);
                  setStartMinutes(
                    isNull(startMinutes) || startMinutes >= minutes
                      ? null
                      : startMinutes,
                  );
                  setEndMinutes(Number.isNaN(minutes) ? null : minutes);
                }}
              />
            </div>

            <ResponsiveDialogFooter>
              <Button
                className="flex-1 sm:flex-none"
                type="submit"
                disabled={editList.isPending || !open}
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

export default EditList;
