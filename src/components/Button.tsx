import { Slot } from "@radix-ui/react-slot";
import { useObjectRef } from "@react-aria/utils";
import { cva } from "class-variance-authority";
import type { ReactElement, ReactNode } from "react";
import { Children, forwardRef } from "react";
import { type AriaButtonOptions, useButton, useFocusVisible } from "react-aria";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
} & (({ asChild?: false } & AriaButtonOptions<"button">) | { asChild: true });

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { asChild, className, disabled = false, children, ...rest },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef);
    const Comp = asChild && !disabled ? Slot : "button";

    const { isFocusVisible } = useFocusVisible();

    const { buttonProps, isPressed } = useButton(
      { ...rest, isDisabled: disabled },
      ref,
    );

    return (
      <Comp
        className={twMerge(
          cva(
            `inline-block cursor-pointer select-none rounded-md bg-violet-800
            px-4 py-1.5 text-center text-white focus:outline-none`,
            {
              variants: {
                disabled: { true: "opacity-50" },
                isPressed: { true: "" },
                isFocusVisible: {
                  true: [
                    `ring-violet-700 ring-offset-2 ring-offset-violet-950
                    focus:ring-2`,
                  ],
                },
              },
              compoundVariants: [
                {
                  isPressed: true,
                  disabled: false,
                  className: "bg-violet-900",
                },
                {
                  isPressed: false,
                  disabled: false,
                  className: "sm:hover:bg-violet-700",
                },
              ],
            },
          )({ disabled, isPressed, isFocusVisible }),
          className,
        )}
        type={Comp === "button" ? "button" : undefined}
        {...buttonProps}
        disabled={Comp === "button" ? disabled : undefined}
        ref={ref}
      >
        {asChild && disabled
          ? (Children.only(children) as ReactElement<{ children?: ReactNode }>)
              .props.children
          : children}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export default Button;
