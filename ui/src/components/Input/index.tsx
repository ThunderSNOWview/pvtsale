export type { IBaseInputProps as IInputProps } from "./BaseInput";
import BaseInput from "./BaseInput";
import InputNumber from "./Number";
import Textarea from "./Textarea";

export type TInput = typeof BaseInput & {
  Number: typeof InputNumber;
  Textarea: typeof Textarea;
};

const Input: TInput = Object.assign(BaseInput, {
  Number: InputNumber,
  Textarea: Textarea,
});

export default Input;
