import { cloneDeep, isNil, padStart, range, set } from "lodash";
import { type ListData } from "~/pages";
import { api } from "~/utils/api";

const EditListTimeRange = ({ list }: { list: ListData }) => {
  const utils = api.useContext();

  const editListTimeRange = api.list.editTimeRange.useMutation({
    onMutate: async (input) => {
      await utils.list.getAll.cancel();
      const prevData = utils.list.getAll.getData();
      const optimisticData = cloneDeep(prevData);

      const listIndex = optimisticData?.findIndex((_) => _.id === list.id);

      if (!isNil(optimisticData) && !isNil(listIndex)) {
        set(optimisticData, [listIndex, "startMinutes"], input.startMinutes);
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
    <div className="flex justify-center">
      <select
        className="rounded-md border border-[#5b2da0] bg-[#411f72] px-2 py-1"
        value={list.startMinutes ?? ""}
        onChange={(e) => {
          const startMinutes = parseInt(e.target.value, 10);
          editListTimeRange.mutate({
            id: list.id,
            startMinutes: Number.isNaN(startMinutes) ? null : startMinutes,
          });
        }}
      >
        <option value="">-</option>
        {range(96).map((_) => (
          <option key={_} value={_ * 15}>
            {((_ / 4) | 0) % 12 || 12}:
            {padStart(((_ % 4) * 15).toString(), 2, "0")}
            {(_ / 48) | 0 ? "pm" : "am"}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EditListTimeRange;
