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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { EditIcon } from "./Icons";

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
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(list.title);

  const initialRepeatDays = useMemo(
    () => daysOfWeek.filter((weekday) => list[`repeats${weekday}`]),
    [list],
  );

  const [repeatDays, setRepeatDays] = useState(initialRepeatDays);

  const [startMinutes, setStartMinutes] = useState(list.startMinutes);
  const [endMinutes, setEndMinutes] = useState(list.endMinutes);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <span
        className="w-full select-none font-bold"
        onDoubleClick={() => setOpen(true)}
      >
        {list.title}
      </span>

      <DialogTrigger asChild>
        <button className="px-2 text-gray-400 hover:text-white" title="Edit">
          <EditIcon />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit list</DialogTitle>
        </DialogHeader>

        <form className="w-full" onSubmit={handleSubmit} tabIndex={0}>
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
                className="border-r border-violet-500 px-2 py-1 text-violet-300
                  last:border-r-0 data-[state=on]:bg-violet-900
                  data-[state=on]:text-white"
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

          <button
            className="w-full rounded-md border-violet-500 bg-violet-900 px-2
              py-1 text-violet-100 disabled:opacity-60"
            type="submit"
            disabled={editList.isPending}
          >
            Save
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditList;
