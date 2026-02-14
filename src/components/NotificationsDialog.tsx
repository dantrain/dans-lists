"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import { VisuallyHidden } from "react-aria";
import { env } from "~/env";
import { usePush } from "~/hooks/usePush";
import { api } from "~/trpc/react";
import Button from "./Button";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} from "./ResponsiveDialog";
import Switch from "./Switch";

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const period = hour < 12 ? "am" : "pm";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return {
    value: `${hour}:${minute.toString().padStart(2, "0")}`,
    label: `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`,
    hour,
    minute,
  };
});

type NotificationsDialogProps = {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NotificationsDialog({
  trigger,
  open,
  onOpenChange,
}: NotificationsDialogProps) {
  const {
    pushNotificationsSupported,
    isSubscribed,
    canSendPush,
    subscribeToPush,
    unsubscribeFromPush,
    requestPermission,
  } = usePush();

  const utils = api.useUtils();

  const { data: settings } = api.notification.getSettings.useQuery(undefined, {
    enabled: open,
  });

  const updateSettings = api.notification.updateSettings.useMutation({
    onMutate: async (input) => {
      await utils.notification.getSettings.cancel();
      const prevData = utils.notification.getSettings.getData();

      utils.notification.getSettings.setData(undefined, (old) =>
        old
          ? {
              ...old,
              enabled: input.enabled,
              hour: input.hour,
              minute: input.minute,
            }
          : old,
      );

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      utils.notification.getSettings.setData(undefined, ctx?.prevData);
    },
  });

  const createPushSubscription =
    api.notification.createPushSubscription.useMutation();

  const setItemNotify = api.notification.setItemNotify.useMutation({
    onMutate: async (input) => {
      await utils.notification.getSettings.cancel();
      const prevData = utils.notification.getSettings.getData();

      utils.notification.getSettings.setData(undefined, (old) => {
        if (!old) return old;

        return {
          ...old,
          lists: old.lists.map((list) => ({
            ...list,
            items: list.items.map((item) =>
              item.id === input.itemId
                ? { ...item, notifyEnabled: input.enabled }
                : item,
            ),
          })),
        };
      });

      return { prevData };
    },
    onError: (_err, _input, ctx) => {
      utils.notification.getSettings.setData(undefined, ctx?.prevData);
    },
  });

  const [isPending, setIsPending] = useState(false);

  const handleEnabledChange = useCallback(
    async (checked: boolean) => {
      setIsPending(true);

      try {
        if (checked) {
          let permissionGranted = canSendPush;

          if (!permissionGranted) {
            permissionGranted = (await requestPermission()) === "granted";
          }

          if (!permissionGranted) {
            setIsPending(false);

            return;
          }

          subscribeToPush(
            env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            (subscription) => {
              const keys = subscription.toJSON().keys!;

              createPushSubscription.mutate({
                endpoint: subscription.endpoint,
                p256dhKey: keys.p256dh!,
                authKey: keys.auth!,
              });
            },
            (error) => {
              console.error("Subscribe error:", error);
            },
          );

          updateSettings.mutate({
            enabled: true,
            hour: settings?.hour ?? 9,
            minute: settings?.minute ?? 0,
          });

          setIsPending(false);
        } else {
          unsubscribeFromPush(
            () => {
              updateSettings.mutate({
                enabled: false,
                hour: settings?.hour ?? 9,
                minute: settings?.minute ?? 0,
              });

              setIsPending(false);
            },
            (error) => {
              console.error("Unsubscribe error:", error);
              setIsPending(false);
            },
          );
        }
      } catch {
        setIsPending(false);
      }
    },
    [
      canSendPush,
      requestPermission,
      subscribeToPush,
      unsubscribeFromPush,
      createPushSubscription,
      updateSettings,
      settings,
    ],
  );

  const handleTimeChange = useCallback(
    (value: string) => {
      const [hour, minute] = value.split(":").map(Number) as [number, number];

      updateSettings.mutate({
        enabled: settings?.enabled ?? true,
        hour,
        minute,
      });
    },
    [updateSettings, settings],
  );

  const selectedTime = useMemo(() => {
    if (!settings) return "9:00";

    return `${settings.hour}:${settings.minute.toString().padStart(2, "0")}`;
  }, [settings]);

  const showIosGuidance =
    !pushNotificationsSupported &&
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label htmlFor="notifications-enabled" className="font-medium">
          Enable notifications
        </label>
        <Switch
          id="notifications-enabled"
          checked={!!(settings?.enabled && isSubscribed)}
          onCheckedChange={handleEnabledChange}
          disabled={isPending || !pushNotificationsSupported}
        />
      </div>

      {showIosGuidance && (
        <p className="text-sm text-gray-400">
          Push notifications require the app to be installed to the home screen
          on iOS.
        </p>
      )}

      {settings && (
        <>
          <div className="flex items-center justify-between">
            <label htmlFor="notification-time" className="font-medium">
              Notification time
            </label>
            <select
              id="notification-time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="appearance-none rounded border
                border-[hsl(264,56%,40%)] bg-[hsl(264,56%,28%)]
                bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22white%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.646%206.646a.5.5%200%200%201%20.708%200L8%209.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                bg-size-[1.25rem_1.25rem] bg-position-[right_0.5rem_center]
                bg-no-repeat py-1.5 pr-8 pl-3 text-sm text-white"
            >
              {timeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="add-tracked-item"
              className="mb-3 block font-medium"
            >
              Items to track
            </label>
            <select
              id="add-tracked-item"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setItemNotify.mutate({
                    itemId: e.target.value,
                    enabled: true,
                  });
                }
              }}
              className="mb-3 w-full appearance-none rounded border
                border-[hsl(264,56%,40%)] bg-[hsl(264,56%,28%)]
                bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22white%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.646%206.646a.5.5%200%200%201%20.708%200L8%209.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                bg-size-[1.25rem_1.25rem] bg-position-[right_0.5rem_center]
                bg-no-repeat py-1.5 pr-8 pl-3 text-sm text-white"
            >
              <option value="">Add an item...</option>
              {settings.lists.map((list) => (
                <optgroup key={list.id} label={list.title}>
                  {list.items
                    .filter((item) => !item.notifyEnabled)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            <ul className="flex flex-wrap gap-2">
              {settings.lists.flatMap((list) =>
                list.items
                  .filter((item) => item.notifyEnabled)
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex rounded-md bg-violet-900 py-0.5 pl-3"
                    >
                      {item.title}
                      <Button
                        className="leading-[0.8]"
                        variant="icon"
                        onPress={() =>
                          setItemNotify.mutate({
                            itemId: item.id,
                            enabled: false,
                          })
                        }
                      >
                        ×<VisuallyHidden>Remove</VisuallyHidden>
                      </Button>
                    </li>
                  )),
              )}
            </ul>
          </div>
        </>
      )}

      <ResponsiveDialogFooter>
        <ResponsiveDialogClose asChild>
          <Button>Done</Button>
        </ResponsiveDialogClose>
      </ResponsiveDialogFooter>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title="Notifications"
      content={content}
    />
  );
}
