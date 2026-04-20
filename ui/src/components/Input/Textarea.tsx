import React from "react";

import { cn } from "@/lib/utils";
import { Textarea as UITextarea } from "../ui/textarea";

export interface ITextareaProps extends React.ComponentProps<"textarea"> {
  rootProps?: React.ComponentProps<"div">;
  error?: boolean;
  helperText?: string;
  helperTextCls?: string;
}

export default function Textarea({ rootProps, error, helperText, helperTextCls, ...props }: ITextareaProps) {
  return (
    <div {...rootProps}>
      <UITextarea {...props} className={cn("w-full", props.className, error ? "border-red-500" : "")} />
      {helperText && <p className={cn("text-xs mt-1", helperTextCls, error ? "text-red-500" : "")}>{helperText}</p>}
    </div>
  );
}
