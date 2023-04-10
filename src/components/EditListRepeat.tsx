import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useMemo } from "react";
import { daysOfWeek, type ListData } from "~/pages";

const EditListRepeat = ({ list }: { list: ListData }) => {
  const value = useMemo(
    () => daysOfWeek.filter((weekday) => list[`repeats${weekday}`]),
    [list]
  );

  return (
    <div className="flex justify-center py-1">
      <ToggleGroup.Root
        className="flex overflow-hidden rounded-md border border-violet-500"
        type="multiple"
        value={value}
      >
        {daysOfWeek.map((_) => (
          <ToggleGroup.Item
            key={_}
            className="border-r border-violet-500 px-2 py-1 text-violet-300 last:border-r-0 data-[state=on]:bg-violet-900 data-[state=on]:text-white"
            value={_}
          >
            {_}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
};

export default EditListRepeat;
