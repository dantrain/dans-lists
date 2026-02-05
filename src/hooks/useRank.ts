import type { DragDropEvents } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
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

  const handleDragEnd: DragDropEvents["dragend"] = (event) => {
    const { source, target } = event.operation;

    if (event.canceled || !source || !target) return;

    if (source.id !== target.id) {
      setItems((items) => {
        const newItems = move(items, event);

        const newIndex = newItems.findIndex((_) => _.id === source.id);

        onMove(
          {
            id: source.id as string,
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
