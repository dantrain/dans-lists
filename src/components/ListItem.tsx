import { first } from "lodash";
import { type Item } from "~/pages";
import Checkbox from "./Checkbox";

type ListItemProps = {
  item: Item;
  onCheckedChange: (item: Item) => void;
};

const ListItem = ({ item, onCheckedChange }: ListItemProps) => {
  const { id, title, events } = item;
  const checked = first(events)?.status.name === "COMPLETE";

  return (
    <li className="mb-2 flex items-center">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onCheckedChange(item)}
      />
      <label className="pl-1" htmlFor={id}>
        {title}
      </label>
    </li>
  );
};

export default ListItem;
