import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

const useRank = <T extends { id: string }>(
  data: T[],
  onMove: (
    variables: {
      id: string;
      beforeId?: string;
      afterId?: string;
    },
    options: { onError: () => void },
  ) => void,
) => {
  const [items, setItems] = useState(data);

  useEffect(() => {
    setItems(data);
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((_) => _.id === active.id);
        const newIndex = items.findIndex((_) => _.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        onMove(
          {
            id: active.id as string,
            beforeId: newItems[newIndex - 1]?.id,
            afterId: newItems[newIndex + 1]?.id,
          },
          {
            onError: () => {
              setItems(data);
            },
          },
        );

        return newItems;
      });
    }
  };

  return [items, handleDragEnd] as const;
};

export default useRank;
