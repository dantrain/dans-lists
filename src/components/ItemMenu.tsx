import * as ContextMenu from "@radix-ui/react-context-menu";
import { type ReactNode } from "react";
import { CheckboxOutlineBlankIcon, IndeterminateCheckboxIcon } from "./Icons";
import MenuItem from "./MenuItem";

const ItemMenu = ({
  children,
  skipped,
  onToggleSkip,
}: {
  children: ReactNode;
  skipped: boolean;
  onToggleSkip: () => void;
}) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        className="flex flex-1 rounded-sm p-1 data-[state=open]:bg-white/10"
      >
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[150px] cursor-default overflow-hidden rounded border
            border-[hsl(264,56%,40%)] bg-[hsl(264,56%,28%)] text-sm text-white
            shadow-xl"
        >
          <ContextMenu.Item
            className="group p-1 focus:outline-none"
            onClick={onToggleSkip}
          >
            <MenuItem>
              {!skipped ? (
                <>
                  Skip
                  <IndeterminateCheckboxIcon />
                </>
              ) : (
                <>
                  Unskip
                  <CheckboxOutlineBlankIcon />
                </>
              )}
            </MenuItem>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default ItemMenu;
