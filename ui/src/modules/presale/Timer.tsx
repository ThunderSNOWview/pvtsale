import useTimerCountdown from "@/hooks/useTimerCountdown";

export default function CountdownTimer({ to }: { to: number | undefined }) {
  const countdown = useTimerCountdown({
    to: to,
  });

  return (
    <div className="grid grid-cols-4 gap-2">
      {(["day", "hour", "minute", "second"] as const).map((unit, i) => {
        const labels = ["Days", "Hrs", "Min", "Sec"];
        const values = [
          countdown?.formatted.day || "00",
          countdown?.formatted.hour || "00",
          countdown?.formatted.minute || "00",
          countdown?.formatted.second || "00",
        ];
        return (
          <div key={unit} className="rounded-xl bg-stone-50 p-3 text-center ring-1 ring-stone-200/80">
            <div className="font-display text-2xl font-semibold text-stone-900">{values[i]}</div>
            <div className="text-[10px] font-medium text-stone-500">{labels[i]}</div>
          </div>
        );
      })}
    </div>
  );
}
