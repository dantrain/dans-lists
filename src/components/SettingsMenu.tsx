import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import { type ReactNode } from "react";
import { LogoutIcon, SettingsIcon } from "./Icons";

const MenuItem = ({ children }: { children: ReactNode }) => (
  <div className="relative flex min-w-[200px] items-center justify-between rounded-sm p-3 pl-8 group-hover:bg-[rgba(255,255,255,0.1)] group-focus-visible:bg-[rgba(255,255,255,0.1)]">
    {children}
  </div>
);

const SettingsMenu = () => {
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
            checked={false}
            onCheckedChange={(checked) => undefined}
          >
            <MenuItem>
              <DropdownMenu.ItemIndicator className="absolute left-3 top-[14px]">
                Checked
              </DropdownMenu.ItemIndicator>
              Edit items
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
