import clsx from "clsx";
import { useAtomValue } from "jotai";
import { first } from "lodash";
import { editModeAtom, type ItemData } from "~/pages";
import { api } from "~/utils/api";
import Checkbox from "./Checkbox";
import EditItem from "./EditItem";
import { DeleteIcon, DragIndicatorIcon } from "./Icons";

type ListItemProps = {
  item: ItemData;
  onCheckedChange: (item: ItemData) => void;
};

const Item = ({ item, onCheckedChange }: ListItemProps) => {
  const { id, title, events } = item;
  const checked = first(events)?.status.name === "COMPLETE";

  const utils = api.useContext();

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
            onCheckedChange={() => onCheckedChange(item)}
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
