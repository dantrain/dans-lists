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
  variant?: "default" | "outline" | "icon";
  disabled?: boolean;
  onClick?: () => void;
} & (({ asChild?: false } & AriaButtonOptions<"button">) | { asChild: true });

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      className,
      variant = "default",
      disabled = false,
      onClick,
      children,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef);
    const Comp = asChild && !disabled ? Slot : "button";

    const { isFocusVisible } = useFocusVisible();

    const { buttonProps, isPressed } = useButton(
      { onPress: onClick, ...rest, isDisabled: disabled },
      ref,
    );

    return (
      <Comp
        className={twMerge(
          cva(
            `inline-block cursor-pointer select-none rounded-sm text-center
            text-violet-100 focus:outline-none`,
            {
              variants: {
                variant: {
                  default: "rounded-md bg-violet-800 px-4 py-1.5",
                  outline: [
                    `rounded-md px-4 py-1.5 shadow-[inset_0_0_0_2px]
                    shadow-violet-800`,
                  ],
                  icon: "px-2 text-gray-400",
                },
                disabled: { true: "opacity-50" },
                isPressed: { true: "" },
                isFocusVisible: {
                  true: [
                    `ring-violet-600 ring-offset-2 ring-offset-violet-950
                    focus:ring-2`,
                  ],
                },
              },
              compoundVariants: [
                {
                  variant: "default",
                  isPressed: false,
                  disabled: false,
                  className: "sm:hover:bg-violet-700 sm:hover:text-white",
                },
                {
                  variant: "outline",
                  isPressed: false,
                  disabled: false,
                  className: "sm:hover:text-white sm:hover:shadow-violet-700",
                },
                {
                  variant: "icon",
                  isPressed: false,
                  disabled: false,
                  className: "sm:hover:text-white",
                },
                {
                  variant: "default",
                  isPressed: true,
                  disabled: false,
                  className: "bg-violet-900",
                },
                {
                  variant: "outline",
                  isPressed: true,
                  disabled: false,
                  className: "shadow-violet-900",
                },
                {
                  variant: "icon",
                  isPressed: true,
                  disabled: false,
                  className: "text-gray-300",
                },
              ],
            },
          )({ variant, disabled, isPressed, isFocusVisible }),
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
