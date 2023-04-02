import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAtom } from "jotai";
import { signOut } from "next-auth/react";
import { type ReactNode } from "react";
import { editModeAtom } from "~/pages";
import { CheckIcon, EditIcon, LogoutIcon, SettingsIcon } from "./Icons";

const MenuItem = ({ children }: { children: ReactNode }) => (
  <div className="relative flex min-w-[200px] items-center justify-between rounded-sm p-3 pl-8 group-hover:bg-[rgba(255,255,255,0.1)] group-focus-visible:bg-[rgba(255,255,255,0.1)]">
    {children}
  </div>
);

const SettingsMenu = () => {
  const [editMode, setEditMode] = useAtom(editModeAtom);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="fixed right-3 top-3 text-gray-200"
          aria-label="Settings"
        >
          <SettingsIcon width="20" height="20" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="cursor-default overflow-hidden rounded border border-[hsl(264,56%,40%)] bg-[hsl(264,56%,28%)] text-sm text-white shadow-xl"
          sideOffset={6}
          collisionPadding={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenu.CheckboxItem
            className="group px-1 pt-1 focus:outline-none"
            checked={editMode}
            onCheckedChange={(checked) => {
              setEditMode(checked);
            }}
          >
            <MenuItem>
              <DropdownMenu.ItemIndicator className="absolute left-2">
                <CheckIcon />
              </DropdownMenu.ItemIndicator>
              Edit items
              <EditIcon width="18" height="18" />
            </MenuItem>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Item
            className="group px-1 pb-1 focus:outline-none"
            onClick={() => void signOut()}
          >
            <MenuItem>
              Sign out
              <LogoutIcon width="18" height="18" />
            </MenuItem>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SettingsMenu;
