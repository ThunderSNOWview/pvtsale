import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type FormStepSectionProps = {
  step: number;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

export function FormStepSection({ step, title, description, icon: Icon, children, className }: FormStepSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-stone-50/90 before:to-transparent before:to-40%",
        className,
      )}
    >
      <div className="relative mb-6 flex gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
          {step}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-2">
            {Icon ? <Icon className="size-4 text-primary" strokeWidth={2} aria-hidden /> : null}
            <h2 className="font-display text-lg font-semibold tracking-tight text-stone-900">{title}</h2>
          </div>
          {description ? <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{description}</p> : null}
        </div>
      </div>
      <div className="relative space-y-4">{children}</div>
    </section>
  );
}
