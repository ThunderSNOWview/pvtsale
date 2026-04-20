import { ChangeEvent, forwardRef } from "react";

import BaseInput, { IBaseInputProps } from "./BaseInput";
import { escapeRegExp } from "@/utils/format";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const InputNumber = forwardRef<HTMLInputElement, IBaseInputProps>(function InputNumber({ onChange, ...props }, ref) {
  const internalOnChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const nextUserInput = ev.target.value;
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      if (typeof onChange === "function") onChange(ev);
    }
  };

  return (
    <BaseInput
      {...props}
      onChange={internalOnChange}
      ref={ref}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
    />
  );
});

export default InputNumber;
