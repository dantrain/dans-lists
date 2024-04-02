"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAtomValue, useSetAtom } from "jotai";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  CheckIcon,
  EditIcon,
  InstallDesktopIcon,
  InstallMobileIcon,
  LogoutIcon,
  RefreshIcon,
  SettingsIcon,
} from "./Icons";
import { editModeAtom, editModeSetterAtom } from "./Lists";
import MenuItem from "./MenuItem";

const SettingsMenu = () => {
  const editMode = useAtomValue(editModeAtom);
  const setEditMode = useSetAtom(editModeSetterAtom);

  const router = useRouter();
  const utils = api.useUtils();

  const [isStandalone, setIsStandalone] = useState(false);

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
      });

      window.addEventListener("appinstalled", () => {
        setInstallPrompt(null);
      });

      setIsStandalone(
        window.matchMedia(
          "(display-mode: standalone), (display-mode: fullscreen)",
        ).matches,
      );
    }
  }, []);

  const handleInstall = useCallback(() => {
    void installPrompt?.prompt();
  }, [installPrompt]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="absolute right-0 top-0 p-3 text-gray-200 sm:fixed"
          aria-label="Settings"
        >
          <SettingsIcon width="20" height="20" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] cursor-default overflow-hidden rounded border
            border-[hsl(264,56%,40%)] bg-[hsl(264,56%,28%)] text-sm text-white
            shadow-xl"
          sideOffset={-6}
          collisionPadding={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenu.CheckboxItem
            className="group px-1 pt-1 focus:outline-none"
            checked={editMode}
            onCheckedChange={(checked) => {
              if (!checked) void utils.list.invalidate();
              setEditMode(checked);
            }}
          >
            <MenuItem padLeft>
              <DropdownMenu.ItemIndicator className="absolute left-2">
                <CheckIcon />
              </DropdownMenu.ItemIndicator>
              Edit items
              <EditIcon width="18" height="18" />
            </MenuItem>
          </DropdownMenu.CheckboxItem>
          {!!installPrompt && (
            <DropdownMenu.Item
              className="group px-1 pb-1 focus:outline-none"
              onClick={handleInstall}
            >
              <MenuItem padLeft>
                Install app
                <InstallMobileIcon
                  className="mr-[1px] sm:hidden"
                  width="18"
                  height="18"
                />
                <InstallDesktopIcon
                  className="mr-[1px] hidden sm:block"
                  width="18"
                  height="18"
                />
              </MenuItem>
            </DropdownMenu.Item>
          )}
          {isStandalone && (
            <DropdownMenu.Item
              className="group px-1 pb-1 focus:outline-none"
              onClick={() => location.reload()}
            >
              <MenuItem padLeft>
                Reload
                <RefreshIcon width="20" height="20" />
              </MenuItem>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            className="group px-1 pb-1 focus:outline-none"
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/signin");
            }}
          >
            <MenuItem padLeft>
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
