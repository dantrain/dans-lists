import clsx from "clsx";
import { useAtomValue } from "jotai";
import { first } from "lodash";
import { editModeAtom, type ItemData } from "~/pages";
import { api } from "~/utils/api";
import Checkbox from "./Checkbox";
import { DeleteIcon } from "./Icons";

type ListItemProps = {
  item: ItemData;
  onCheckedChange: (item: ItemData) => void;
};

const Item = ({ item, onCheckedChange }: ListItemProps) => {
  const { id, title, events } = item;
  const checked = first(events)?.status.name === "COMPLETE";

  const utils = api.useContext();

  const deleteItem = api.example.deleteItem.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  const editMode = useAtomValue(editModeAtom);

  return (
    <li className="my-2 flex items-center pr-1">
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
      {editMode && (
        <button
          className="px-2 text-gray-400 hover:text-white"
          title="Delete"
          onClick={() => deleteItem.mutate({ id })}
        >
          <DeleteIcon />
        </button>
      )}
    </li>
  );
};

export default Item;
