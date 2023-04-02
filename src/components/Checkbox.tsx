import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { type ComponentProps } from "react";
import { CheckboxIcon, CheckboxOutlineBlankIcon } from "./Icons";

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
