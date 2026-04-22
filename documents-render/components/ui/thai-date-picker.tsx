"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { getDateLib, th as thLocale } from "react-day-picker/buddhist"
import type { Numerals } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const BANGKOK_TZ = "Asia/Bangkok"

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

/** แปลง Date เป็น { day, month, year } โดยใช้ timezone ไทย + ปี พ.ศ. */
export function toThaiDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date)

  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0")

  return {
    day: String(get("day")),
    month: THAI_MONTHS[get("month") - 1],
    year: String(get("year") + 543),
  }
}

/** แสดงวันที่ในรูปแบบไทย เช่น "19 เมษายน 2568" */
export function formatThaiDate(date: Date): string {
  const { day, month, year } = toThaiDateParts(date)
  return `${day} ${month} ${year}`
}

// DateLib สำหรับปฏิทินพุทธศักราช + timezone ไทย
const buddhistDateLib = getDateLib({ locale: thLocale, timeZone: BANGKOK_TZ })

// ช่วงปีที่แสดงใน dropdown (ปี ค.ศ.)
const DROPDOWN_START = new Date(1960, 0)
const DROPDOWN_END = new Date(new Date().getFullYear() + 2, 11)

interface ThaiDatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  numerals?: Numerals
}

export function ThaiDatePicker({
  value,
  onChange,
  placeholder = "เลือกวันที่",
  className,
  numerals = "thai",
}: ThaiDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-full justify-start gap-2 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          {value ? formatThaiDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          locale={thLocale}
          numerals={numerals}
          captionLayout="dropdown"
          dateLib={buddhistDateLib}
          timeZone={BANGKOK_TZ}
          startMonth={DROPDOWN_START}
          endMonth={DROPDOWN_END}
          defaultMonth={value ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
