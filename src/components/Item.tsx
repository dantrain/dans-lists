import { useSortable } from "@dnd-kit/react/sortable";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { cloneDeep, isNil, set, shuffle } from "lodash-es";
import { type AppRouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import Checkbox from "./Checkbox";
import DeleteItem from "./DeleteItem";
import EditItem from "./EditItem";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowIcon,
  DragIndicatorIcon,
  ShuffleIcon,
} from "./Icons";
import ItemMenu from "./ItemMenu";
import { TzOffsetContext, editModeTransitionAtom } from "./Lists";
import { useContext, useEffect, useRef, useState } from "react";
import { useInteractOutside } from "react-aria";
import { getNow } from "~/utils/date";
import { VisuallyHidden } from "react-aria";
import Button from "./Button";

type ListItemProps = {
  item: AppRouterOutputs["list"]["getAll"][0]["items"][0];
  index: number;
};

const getInitialShuffleChoice = (
  shuffleChoices: ListItemProps["item"]["shuffleChoices"],
  tzOffset: number,
) => {
  return shuffleChoices.length
    ? shuffleChoices[getNow(tzOffset).daysSince1970 % shuffleChoices.length]
    : undefined;
};

const Item = ({ item, index }: ListItemProps) => {
  const { id, title, event, streak, shuffleMode, shuffleChoices } = item;
  const status = event?.status.name ?? "PENDING";
  const tzOffset = useContext(TzOffsetContext);

  const initialChoice =
    event?.shuffleChoice ?? getInitialShuffleChoice(shuffleChoices, tzOffset);

  const [shuffleChoice, setShuffleChoice] = useState(initialChoice);

  const [shuffledArray, setShuffledArray] = useState(() =>
    shuffle([...shuffleChoices]),
  );

  const [shuffleIndex, setShuffleIndex] = useState(() => {
    if (initialChoice) {
      const idx = shuffledArray.findIndex((c) => c.id === initialChoice.id);
      if (idx >= 0) return idx;
    }

    return 0;
  });

  useEffect(() => {
    const choice =
      event?.shuffleChoice ?? getInitialShuffleChoice(shuffleChoices, tzOffset);

    setShuffleChoice(choice);

    const newShuffled = shuffle([...shuffleChoices]);
    setShuffledArray(newShuffled);

    if (choice) {
      const idx = newShuffled.findIndex((c) => c.id === choice.id);
      setShuffleIndex(idx >= 0 ? idx : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(item.shuffleChoices), tzOffset]);

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
      shuffleChoiceId: shuffleChoice?.id,
    });

  const handleToggleSkip = () =>
    upsertEvent.mutate({
      itemId: id,
      statusName: status === "SKIPPED" ? "PENDING" : "SKIPPED",
      shuffleChoiceId: shuffleChoice?.id,
    });

  const [navigating, setNavigating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useInteractOutside({
    ref: navRef,
    isDisabled: !navigating,
    onInteractOutside: () => setNavigating(false),
  });

  const navigateChoice = (direction: 1 | -1) => {
    if (shuffledArray.length === 0) return;

    const nextIndex =
      (shuffleIndex + direction + shuffledArray.length) % shuffledArray.length;
    const choice = shuffledArray[nextIndex];

    setShuffleIndex(nextIndex);
    setShuffleChoice(choice);

    upsertEvent.mutate({
      itemId: id,
      statusName: status,
      shuffleChoiceId: choice?.id,
    });
  };

  const handleShuffleClick = () => {
    setNavigating(true);
  };

  const editMode = useAtomValue(editModeTransitionAtom);

  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    type: "item",
  });

  return (
    <li
      className="relative flex items-center pr-1"
      ref={ref}
      style={{
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
            ref={handleRef}
          >
            <DragIndicatorIcon className="w-6 pr-2" width={20} height={20} />
          </button>
          <EditItem item={item} />
          <DeleteItem item={item} />
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
            className={clsx("grow pl-1 select-none", {
              "text-gray-400": checked,
              "line-through": checked === "indeterminate",
            })}
            htmlFor={id}
          >
            {shuffleMode && shuffleChoice ? shuffleChoice.title : title}
          </label>
          {shuffleMode && status === "PENDING" && (
            <>
              {navigating ? (
                <div ref={navRef} className="flex">
                  <Button
                    variant="icon"
                    className="pr-0"
                    onPress={() => navigateChoice(-1)}
                  >
                    <ChevronLeftIcon width={20} height={20} />
                    <VisuallyHidden>Previous</VisuallyHidden>
                  </Button>
                  <Button
                    variant="icon"
                    className="pl-0"
                    onPress={() => navigateChoice(1)}
                  >
                    <ChevronRightIcon width={20} height={20} />
                    <VisuallyHidden>Next</VisuallyHidden>
                  </Button>
                </div>
              ) : (
                <Button variant="icon" onPress={handleShuffleClick}>
                  <ShuffleIcon />
                  <VisuallyHidden>Shuffle</VisuallyHidden>
                </Button>
              )}
            </>
          )}
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
