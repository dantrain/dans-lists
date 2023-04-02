import clsx from "clsx";
import { first } from "lodash";
import { type ItemData } from "~/pages";
import Checkbox from "./Checkbox";

type ListItemProps = {
  item: ItemData;
  onCheckedChange: (item: ItemData) => void;
};

const Item = ({ item, onCheckedChange }: ListItemProps) => {
  const { id, title, events } = item;
  const checked = first(events)?.status.name === "COMPLETE";

  return (
    <li className="mb-2 flex items-center">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onCheckedChange(item)}
      />
      <label
        className={clsx("select-none pl-2", { "text-gray-400": checked })}
        htmlFor={id}
      >
        {title}
      </label>
    </li>
  );
};

export default Item;
