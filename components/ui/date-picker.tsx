"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  /** ISO date string YYYY-MM-DD */
  value?: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Prevent future dates */
  disableFuture?: boolean;
  /** Normalize the selection to the first day of the selected month and display month/year only */
  monthOnly?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  disableFuture,
  monthOnly = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse ISO string → Date object for the calendar
  const selected = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      const normalizedDay = monthOnly ? new Date(day.getFullYear(), day.getMonth(), 1) : day;
      onChange(format(normalizedDay, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, monthOnly ? "MMMM yyyy" : "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={disableFuture ? { after: new Date() } : undefined}
          defaultMonth={selected ?? new Date()}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(new Date().getFullYear() + 1, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
