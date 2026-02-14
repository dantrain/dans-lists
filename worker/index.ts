/// <reference lib="WebWorker" />

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json() as {
    title: string;
    options?: NotificationOptions;
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      icon: "/manifest-icon-512.maskable.png",
      ...payload.options,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const matchingClient = [...windowClients].find((client) =>
          client.url.startsWith(self.location.origin),
        );

        if (matchingClient) {
          return matchingClient.focus();
        }

        return self.clients
          .openWindow(`${self.location.origin}/`)
          .then((client) => client?.focus());
      }),
  );
});
