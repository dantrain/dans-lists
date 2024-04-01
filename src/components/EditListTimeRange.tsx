import { cloneDeep, isNil, isNull, padStart, range, set } from "lodash-es";
import { type SelectHTMLAttributes } from "react";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";

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

const EditListTimeRange = ({
  list,
}: {
  list: AppRouterOutputs["list"]["getAll"][0];
}) => {
  const utils = api.useUtils();

  const editListTimeRange = api.list.editTimeRange.useMutation({
    onMutate: async (input) => {
      await utils.list.getAll.cancel();
      const prevData = utils.list.getAll.getData();
      const optimisticData = cloneDeep(prevData);

      const listIndex = optimisticData?.findIndex((_) => _.id === list.id);

      if (!isNil(optimisticData) && !isNil(listIndex)) {
        set(optimisticData, [listIndex, "startMinutes"], input.startMinutes);
        set(optimisticData, [listIndex, "endMinutes"], input.endMinutes);
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
    <div className="flex justify-center gap-2">
      <TimeRangeSelect
        value={list.startMinutes ?? ""}
        onChange={(e) => {
          const startMinutes = parseInt(e.target.value, 10);
          editListTimeRange.mutate({
            id: list.id,
            startMinutes: Number.isNaN(startMinutes) ? null : startMinutes,
            endMinutes:
              isNull(list.endMinutes) || list.endMinutes <= startMinutes
                ? null
                : list.endMinutes,
          });
        }}
      />
      <span className="leading-7">&#8211;</span>
      <TimeRangeSelect
        className="rounded-md border border-[#5b2da0] bg-[#411f72] px-2 py-1"
        value={list.endMinutes ?? ""}
        onChange={(e) => {
          const endMinutes = parseInt(e.target.value, 10);
          editListTimeRange.mutate({
            id: list.id,
            startMinutes:
              isNull(list.startMinutes) || list.startMinutes >= endMinutes
                ? null
                : list.startMinutes,
            endMinutes: Number.isNaN(endMinutes) ? null : endMinutes,
          });
        }}
      />
    </div>
  );
};

export default EditListTimeRange;
