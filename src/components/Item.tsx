import clsx from "clsx";
import { first } from "lodash";
import { type ItemData } from "~/pages";
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

  return (
    <li className="group mb-2 flex items-center">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onCheckedChange(item)}
      />
      <label
        className={clsx("flex-grow select-none pl-2", {
          "text-gray-400": checked,
        })}
        htmlFor={id}
      >
        {title}
      </label>
      <button
        className="invisible px-2 text-gray-400 hover:text-white group-hover:visible"
        title="Delete"
        onClick={() => deleteItem.mutate({ id })}
      >
        <DeleteIcon />
      </button>
    </li>
  );
};

export default Item;
