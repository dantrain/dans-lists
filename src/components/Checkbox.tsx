import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { type ComponentProps } from "react";

const CheckboxIcon = () => (
  <svg
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const CheckboxOutlineBlankIcon = () => (
  <svg
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
  >
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
  </svg>
);

const Checkbox = ({
  checked,
  ...rest
}: ComponentProps<typeof RadixCheckbox.Root>) => {
  return (
    <RadixCheckbox.Root
      className="cursor-default text-gray-100"
      checked={checked}
      {...rest}
    >
      <RadixCheckbox.Indicator>
        <CheckboxIcon />
      </RadixCheckbox.Indicator>
      {!checked && (
        <span className="pointer-events-none">
          <CheckboxOutlineBlankIcon />
        </span>
      )}
    </RadixCheckbox.Root>
  );
};

export default Checkbox;
