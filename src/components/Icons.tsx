import { type SVGProps } from "react";

const SVGIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    {...props}
  />
);

export const DeleteIcon = () => (
  <SVGIcon>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </SVGIcon>
);

export const CheckboxIcon = () => (
  <SVGIcon>
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </SVGIcon>
);

export const CheckboxOutlineBlankIcon = () => (
  <SVGIcon>
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </SVGIcon>
);
