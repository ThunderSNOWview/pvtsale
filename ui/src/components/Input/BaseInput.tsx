import { Input as UIInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export interface IBaseInputProps extends React.ComponentProps<"input"> {
  startIcon?: React.ReactNode;
  startIconCls?: string;
  endIcon?: React.ReactNode;
  endIconCls?: string;
  fullWidth?: boolean;
  rootProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  error?: boolean;
  helperText?: string;
  helperTextCls?: string;
}

const BaseInput = forwardRef<HTMLInputElement, IBaseInputProps>(function BaseInput(
  { startIcon, startIconCls, endIcon, endIconCls, rootProps, error, helperText, helperTextCls, fullWidth, ...props },
  ref
) {
  return (
    <div {...rootProps} className={cn(rootProps?.className)}>
      <div className={"relative"}>
        {startIcon && (
          <div
            className={cn(
              "absolute inline-flex items-center justify-center -translate-y-1/2 top-1/2 left-3",
              startIconCls
            )}
          >
            {startIcon}
          </div>
        )}
        <UIInput
          ref={ref}
          {...props}
          className={cn(
            startIcon ? "pl-10" : "pl-3",
            endIcon ? "pr-10" : "pr-3",
            "w-full",
            props?.className,
            error ? "border-red-500" : ""
          )}
        />
        {endIcon && (
          <div
            className={cn(
              "absolute inline-flex items-center justify-center -translate-y-1/2 top-1/2 right-3",
              endIconCls
            )}
          >
            {endIcon}
          </div>
        )}
      </div>
      {helperText && <p className={cn("text-xs mt-1", helperTextCls, error ? "text-red-500" : "")}>{helperText}</p>}
    </div>
  );
});

export default BaseInput;
