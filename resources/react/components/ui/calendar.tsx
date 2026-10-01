import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * react-day-picker v9, styled like the rest of the shadcn components. Range
 * ends are solid emerald, the days between them a light tint.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center text-sm font-medium",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "z-10"),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "z-10"),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[0.75rem] font-normal text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 rounded-md p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "rounded-l-md bg-emerald-100 dark:bg-emerald-950 [&>button]:bg-emerald-600 [&>button]:text-white [&>button]:hover:bg-emerald-700 [&>button]:hover:text-white",
        range_end: "rounded-r-md bg-emerald-100 dark:bg-emerald-950 [&>button]:bg-emerald-600 [&>button]:text-white [&>button]:hover:bg-emerald-700 [&>button]:hover:text-white",
        range_middle: "rounded-none bg-emerald-100 dark:bg-emerald-950 [&>button]:rounded-none [&>button]:text-emerald-900 dark:[&>button]:text-emerald-100",
        selected: "[&>button]:bg-emerald-600 [&>button]:text-white",
        today: "[&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  )
}

export { Calendar }
