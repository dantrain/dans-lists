"use client";

import { useEffect, useRef } from "react";
import Cookies from "universal-cookie";
import { api } from "~/trpc/react";

export default function SetTimezoneCookie() {
  const updateTimezone = api.notification.updateTimezone.useMutation();
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    const cookies = new Cookies(null, { path: "/" });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (cookies.get("timeZone") !== timeZone) {
      cookies.set("timeZone", timeZone);
      location.reload();
    } else if (!hasUpdatedRef.current) {
      hasUpdatedRef.current = true;
      updateTimezone.mutate({ timeZone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
