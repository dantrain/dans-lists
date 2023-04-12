import clsx from "clsx";
import { type ReactNode } from "react";

const MenuItem = ({
  children,
  padLeft,
}: {
  children: ReactNode;
  padLeft?: boolean;
}) => (
  <div
    className={clsx(
      "relative flex items-center justify-between rounded-sm p-3 group-hover:bg-[rgba(255,255,255,0.1)] group-focus-visible:bg-[rgba(255,255,255,0.1)]",
      { ["pl-8"]: padLeft }
    )}
  >
    {children}
  </div>
);

export default MenuItem;
