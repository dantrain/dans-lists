import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { cloneDeep, isNil, set } from "lodash";
import { editModeAtom, type ItemData } from "~/pages";
import { api } from "~/utils/api";
import Checkbox from "./Checkbox";
import EditItem from "./EditItem";
import { DeleteIcon, DoubleArrowIcon, DragIndicatorIcon } from "./Icons";
import ItemMenu from "./ItemMenu";

type ListItemProps = {
  item: ItemData;
};

const Item = ({ item }: ListItemProps) => {
  const { id, title, event, streak } = item;
  const status = event?.status.name;

  const currentStreak = status === "COMPLETE" ? streak + 1 : streak;

  const checked =
    status === "SKIPPED"
      ? "indeterminate"
      : status === "COMPLETE"
        ? true
        : false;

  const utils = api.useUtils();

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
          [listIndex, "items", itemIndex, "event", "status", "name"],
          input.statusName,
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
      statusName: status === "COMPLETE" ? "PENDING" : "COMPLETE",
    });

  const handleToggleSkip = () =>
    upsertEvent.mutate({
      itemId: id,
      statusName: status === "SKIPPED" ? "PENDING" : "SKIPPED",
    });

  const deleteItem = api.item.delete.useMutation({
    onSettled: () => void utils.list.getAll.invalidate(),
  });

  const editMode = useAtomValue(editModeAtom);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      className="relative flex items-center pr-1"
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 100 : undefined,
        viewTransitionName: `item-${id}`,
      }}
    >
      {editMode ? (
        <>
          <button
            className={`touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
          >
            <DragIndicatorIcon className="w-6 pr-2" width={20} height={20} />
          </button>
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
        <ItemMenu
          skipped={status === "SKIPPED"}
          onToggleSkip={handleToggleSkip}
        >
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={handleCheckedChanged}
          />
          <label
            className={clsx("flex-grow select-none pl-1 ", {
              "text-gray-400": checked,
              "line-through": checked === "indeterminate",
            })}
            htmlFor={id}
          >
            {title}
          </label>
          {currentStreak > 1 && (
            <div
              className={clsx(
                "flex items-center gap-1 px-2",
                !checked && "text-gray-200",
                checked && "text-gray-400",
              )}
            >
              <DoubleArrowIcon width="15" height="15" />
              <span className="min-w-[0.6em]">{currentStreak}</span>
            </div>
          )}
        </ItemMenu>
      )}
    </li>
  );
};

export default Item;
