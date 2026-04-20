import { cn } from "@/lib/utils";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ toastOptions, className, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors={false}
      className={cn("toaster group", className)}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        style: { pointerEvents: "auto", ...toastOptions?.style },
        classNames: {
          toast: cn(
            "group rounded-2xl border border-stone-200/90 bg-white text-stone-900 shadow-lg",
            toastOptions?.classNames?.toast,
          ),
          title: cn("text-sm font-semibold text-stone-900", toastOptions?.classNames?.title),
          description: cn("text-sm text-stone-600", toastOptions?.classNames?.description),
          actionButton: cn(
            "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90",
            toastOptions?.classNames?.actionButton,
          ),
          cancelButton: cn(
            "rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
            toastOptions?.classNames?.cancelButton,
          ),
          closeButton: cn(
            "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-800",
            toastOptions?.classNames?.closeButton,
          ),
          success: cn(
            "border-emerald-200/90 bg-emerald-50/95 text-stone-900 [&_[data-icon]]:text-emerald-700",
            toastOptions?.classNames?.success,
          ),
          error: cn("border-red-200/90 bg-red-50/95 text-stone-900", toastOptions?.classNames?.error),
          warning: cn("border-amber-200/90 bg-amber-50/95 text-stone-900", toastOptions?.classNames?.warning),
          info: cn("border-sky-200/90 bg-sky-50/95 text-stone-900", toastOptions?.classNames?.info),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
