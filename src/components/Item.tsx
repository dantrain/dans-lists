import { type inferRouterOutputs } from "@trpc/server";
import { first } from "lodash";
import { type AppRouter } from "~/server/api/root";
import Checkbox from "./Checkbox";

type ItemProps = {
  item: inferRouterOutputs<AppRouter>["example"]["getLists"][0]["items"][0];
  onCheckedChange: (id: string, statusName?: string) => void;
};

const Item = ({ item: { id, title, events }, onCheckedChange }: ItemProps) => {
  const checked = first(events)?.status.name === "COMPLETE";

  return (
    <li className="mb-2 flex items-center">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onCheckedChange(id, first(events)?.status.name)}
      />
      <label className="pl-1" htmlFor={id}>
        {title}
      </label>
    </li>
  );
};

export default Item;
