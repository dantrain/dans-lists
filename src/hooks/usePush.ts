import { useEffect, useState } from "react";

export type PushState = {
  isSubscribed: boolean | null;
  pushSubscription: PushSubscription | null;
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToPush: (
    publicKey: string,
    callback?: (subscription: PushSubscription) => void,
    errorCallback?: (error: unknown) => void,
  ) => void;
  unsubscribeFromPush: (
    callback?: () => void,
    errorCallback?: (error: unknown) => void,
  ) => void;
  canSendPush: boolean;
  pushNotificationsSupported: boolean;
};

export const usePush = (): PushState => {
  const [swRegistration, setSWRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [pushSubscription, setPushSubscription] =
    useState<PushSubscription | null>(null);
  const [canSendPush, setCanSendPush] = useState(false);
  const [pushNotificationsSupported, setPushNotificationsSupported] =
    useState(false);

  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setPushNotificationsSupported(true);

      if (Notification?.permission === "granted") {
        setCanSendPush(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setCanSendPush(permission === "granted");

    return permission;
  };

  const subscribeToPush = (
    publicKey: string,
    callback?: (subscription: PushSubscription) => void,
    errorCallback?: (error: unknown) => void,
  ) => {
    if (swRegistration === null) return;

    swRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      })
      .then(
        (subscription) => {
          setIsSubscribed(true);
          setPushSubscription(subscription);
          callback?.(subscription);
        },
        (error) => {
          errorCallback?.(error);
        },
      );
  };

  const unsubscribeFromPush = (
    callback?: () => void,
    errorCallback?: (error: unknown) => void,
  ) => {
    if (swRegistration === null) return;

    swRegistration.pushManager
      .getSubscription()
      .then((subscription) => {
        if (subscription) {
          subscription.unsubscribe().then(
            () => {
              setIsSubscribed(false);
              setPushSubscription(null);
              callback?.();
            },
            (error) => {
              errorCallback?.(error);
            },
          );
        }
      })
      .catch((error) => {
        errorCallback?.(error);
      });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getRegistration = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          setSWRegistration(reg ?? null);
        } catch (err) {
          console.error("Error getting service worker registration:", err);
        }
      }
    };

    const handleControllerChange = () => {
      void getRegistration();
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange,
      );
    }

    void getRegistration();

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (swRegistration) {
      void swRegistration.pushManager
        ?.getSubscription()
        .then((subscription) => {
          setIsSubscribed(!!subscription);
          setPushSubscription(subscription);
        });

      setCanSendPush(
        "Notification" in window && Notification.permission === "granted",
      );
    }
  }, [swRegistration]);

  return {
    isSubscribed,
    pushSubscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    canSendPush,
    pushNotificationsSupported,
  };
};
