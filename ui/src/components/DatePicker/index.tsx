import { cn } from "@/lib/utils";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ChangeEventHandler, useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function DatePicker({
  date,
  onChange,
  error,
  helperText,
  helperTextCls,
}: {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: boolean;
  helperText?: string;
  helperTextCls?: string;
}) {
  const [timeValue, setTimeValue] = useState<string>("");

  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!date) {
      setTimeValue(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error("Invalid time format");
      return;
    }
    const newSelectedDate = setHours(setMinutes(date, minutes), hours);
    onChange(newSelectedDate);
    setTimeValue(time);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (!timeValue || !date) {
      onChange(date);
      return;
    }
    const [hours, minutes] = timeValue.split(":").map((str) => parseInt(str, 10));
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
    onChange(newDate);
  };

  return (
    <div>
      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-grow justify-start border-stone-200 bg-white text-left font-normal text-stone-900 hover:bg-stone-50"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-stone-500" />
              {date ? format(date, "MM/dd/yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-stone-200 bg-white p-0 shadow-lg">
            <Calendar mode="single" selected={date} onSelect={handleDaySelect} autoFocus />
          </PopoverContent>
        </Popover>
        <div className="flex flex-col gap-3">
          <Input
            type="time"
            value={timeValue || (date ? format(date, "HH:mm") : "00:00")}
            onChange={handleTimeChange}
            className="protocol-field appearance-none border-stone-200 bg-white hover:bg-stone-50 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
      {helperText && <p className={cn("text-xs mt-1", helperTextCls, error ? "text-red-500" : "")}>{helperText}</p>}
    </div>
  );
}
