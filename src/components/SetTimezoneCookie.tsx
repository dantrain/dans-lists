"use client";

import { useEffect } from "react";
import Cookies from "universal-cookie";

export default function SetTimezoneCookie() {
  useEffect(() => {
    const cookies = new Cookies(null, { path: "/" });
    const tzOffset = new Date().getTimezoneOffset();

    if (cookies.get("tzOffset") !== tzOffset) {
      cookies.set("tzOffset", tzOffset);
      location.reload();
    }
  }, []);

  return null;
}
