import * as ContextMenu from "@radix-ui/react-context-menu";
import { type ReactNode } from "react";
import { IndeterminateCheckboxIcon } from "./Icons";
import MenuItem from "./MenuItem";

const ItemMenu = ({ children }: { children: ReactNode }) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="flex flex-1">
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[150px] cursor-default overflow-hidden rounded border border-[hsl(264,56%,40%)] bg-[hsl(264,56%,28%)] text-sm text-white shadow-xl">
          <ContextMenu.Item className="group p-1 focus:outline-none">
            <MenuItem>
              Skip
              <IndeterminateCheckboxIcon />
            </MenuItem>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default ItemMenu;
