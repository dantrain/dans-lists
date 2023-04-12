import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { type ComponentProps } from "react";
import {
  CheckboxIcon,
  CheckboxOutlineBlankIcon,
  IndeterminateCheckboxIcon,
} from "./Icons";

const Checkbox = ({
  checked,
  ...rest
}: ComponentProps<typeof RadixCheckbox.Root>) => {
  return (
    <RadixCheckbox.Root
      className="cursor-default px-1 py-2 text-gray-100 sm:py-1"
      checked={checked}
      {...rest}
    >
      <RadixCheckbox.Indicator>
        {checked === "indeterminate" && <IndeterminateCheckboxIcon />}
        {checked === true && <CheckboxIcon />}
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
