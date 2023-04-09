import clsx from "clsx";
import { useAtomValue } from "jotai";
import { cloneDeep, first, isNil, set } from "lodash";
import { editModeAtom, type ItemData } from "~/pages";
import { api } from "~/utils/api";
import Checkbox from "./Checkbox";
import EditItem from "./EditItem";
import { DeleteIcon, DragIndicatorIcon } from "./Icons";

type ListItemProps = {
  item: ItemData;
};

const Item = ({ item }: ListItemProps) => {
  const { id, title, events } = item;
  const checked = first(events)?.status.name === "COMPLETE";

  const utils = api.useContext();

  const upsertEvent = api.event.upsert.useMutation({
    onMutate: async (input) => {
      await utils.list.getAll.cancel();
      const prevData = utils.list.getAll.getData();
      const optimisticData = cloneDeep(prevData);

      let itemIndex;
      const listIndex = optimisticData?.findIndex((list) => {
        itemIndex = list.items.findIndex((item) => item.id === input.itemId);
        return itemIndex >= 0;
      });

      if (
        !isNil(optimisticData) &&
        !isNil(listIndex) &&
        !isNil(itemIndex) &&
        itemIndex >= 0
      ) {
        set(
          optimisticData,
          [listIndex, "items", itemIndex, "events", "0", "status", "name"],
          input.statusName
        );
      }

      utils.list.getAll.setData(undefined, optimisticData);

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      // Roll back
      utils.list.getAll.setData(undefined, ctx?.prevData);
    },
  });

  const handleCheckedChanged = () =>
    upsertEvent.mutate({
      itemId: id,
      statusName:
        first(item.events)?.status.name === "COMPLETE" ? "PENDING" : "COMPLETE",
    });

  const deleteItem = api.item.delete.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const editMode = useAtomValue(editModeAtom);

  return (
    <li className="my-2 flex items-center pr-1">
      {editMode ? (
        <>
          <DragIndicatorIcon className="w-6 pr-2" width={20} height={20} />
          <EditItem item={item} />
          <button
            className="px-2 text-gray-400 hover:text-white"
            title="Delete"
            onClick={() => deleteItem.mutate({ id })}
          >
            <DeleteIcon />
          </button>
        </>
      ) : (
        <>
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={handleCheckedChanged}
          />
          <label
            className={clsx("flex-grow select-none py-1 pl-1 sm:py-0", {
              "text-gray-400": checked,
            })}
            htmlFor={id}
          >
            {title}
          </label>
        </>
      )}
    </li>
  );
};

export default Item;
