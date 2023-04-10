import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cloneDeep, isNil, set } from "lodash";
import { useMemo } from "react";
import { type ListData } from "~/pages";
import { api } from "~/utils/api";
import { daysOfWeek, type Weekday } from "~/utils/date";

const EditListRepeat = ({ list }: { list: ListData }) => {
  const value = useMemo(
    () => daysOfWeek.filter((weekday) => list[`repeats${weekday}`]),
    [list]
  );

  const utils = api.useContext();

  const editListRepeat = api.list.editRepeat.useMutation({
    onMutate: async (input) => {
      await utils.list.getAll.cancel();
      const prevData = utils.list.getAll.getData();
      const optimisticData = cloneDeep(prevData);

      const listIndex = optimisticData?.findIndex((_) => _.id === list.id);

      if (!isNil(optimisticData) && !isNil(listIndex)) {
        daysOfWeek.forEach((day) => {
          set(
            optimisticData,
            [listIndex, `repeats${day}`],
            input.repeatDays.includes(day)
          );
        });
      }

      utils.list.getAll.setData(undefined, optimisticData);

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      // Roll back
      utils.list.getAll.setData(undefined, ctx?.prevData);
    },
  });

  return (
    <div className="flex justify-center py-1">
      <ToggleGroup.Root
        className="flex overflow-hidden rounded-md border border-violet-500"
        type="multiple"
        value={value}
        onValueChange={(value: Weekday[]) => {
          editListRepeat.mutate({ id: list.id, repeatDays: value });
        }}
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
