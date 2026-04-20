

import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonProps, Button as UIButton } from "../ui/button";

export interface BaseButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

const Button = ({ loading, children, loadingText, icon, ...props }: BaseButtonProps) => {
  return (
    <UIButton {...props}>
      {loading ? <Loader2 className="size-[1.2em] animate-spin" /> : icon}
      {loading && loadingText ? loadingText : children}
    </UIButton>
  );
};
export default Button;

export const CopyButton = ({ text, ...props }: ButtonProps & { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000); // Reset after 1 second
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy to clipboard. Please try again.");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      {...props}
      onClick={() => {
        copyToClipboard(text);
      }}
    >
      {copied ? <Check className="size-[1em]" /> : <Copy className="size-[1em]" />}
    </Button>
  );
};
