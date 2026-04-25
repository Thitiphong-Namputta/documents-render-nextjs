"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { loadProvinces, loadDistricts, loadSubDistricts, type Province, type District, type SubDistrict } from "@/lib/thai-address"

type OpenField = "province" | "district" | "subDistrict" | null

export function ThaiAddressFields({ prefix }: { prefix: string }) {
  const { watch, setValue } = useFormContext()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [allDistricts, setAllDistricts] = useState<District[]>([])
  const [allSubDistricts, setAllSubDistricts] = useState<SubDistrict[]>([])
  const [openField, setOpenField] = useState<OpenField>(null)

  const selectedProvince: string = watch(`${prefix}.province`) ?? ""
  const selectedDistrict: string = watch(`${prefix}.district`) ?? ""

  useEffect(() => {
    loadProvinces().then(setProvinces)
    loadDistricts().then(setAllDistricts)
    loadSubDistricts().then(setAllSubDistricts)
  }, [])

  const provinceId = provinces.find(p => p.name_th === selectedProvince)?.id
  const filteredDistricts: District[] = provinceId
    ? allDistricts.filter(d => d.province_id === provinceId)
    : []

  const districtId = allDistricts.find(
    d => d.name_th === selectedDistrict && d.province_id === provinceId
  )?.id
  const filteredSubDistricts: SubDistrict[] = districtId
    ? allSubDistricts.filter(s => s.district_id === districtId)
    : []

  return (
    <>
      <FormField
        name={`${prefix}.province`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>จังหวัด</FormLabel>
            <Popover
              open={openField === "province"}
              onOpenChange={open => setOpenField(open ? "province" : null)}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "h-8 w-full justify-between rounded-lg font-normal shadow-xs",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value || "เลือกจังหวัด"}
                    <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput placeholder="ค้นหาจังหวัด..." />
                  <CommandList>
                    <CommandEmpty>ไม่พบจังหวัด</CommandEmpty>
                    <CommandGroup>
                      {provinces.map(p => (
                        <CommandItem
                          key={p.id}
                          value={p.name_th}
                          data-checked={p.name_th === field.value}
                          onSelect={() => {
                            field.onChange(p.name_th)
                            setValue(`${prefix}.district`, "")
                            setValue(`${prefix}.subDistrict`, "")
                            setOpenField(null)
                          }}
                        >
                          {p.name_th}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${prefix}.district`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>อำเภอ/เขต</FormLabel>
            <Popover
              open={openField === "district"}
              onOpenChange={open => setOpenField(open ? "district" : null)}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!selectedProvince}
                    className={cn(
                      "h-8 w-full justify-between rounded-lg font-normal shadow-xs",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value || "เลือกอำเภอ/เขต"}
                    <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput placeholder="ค้นหาอำเภอ/เขต..." />
                  <CommandList>
                    <CommandEmpty>ไม่พบอำเภอ/เขต</CommandEmpty>
                    <CommandGroup>
                      {filteredDistricts.map(d => (
                        <CommandItem
                          key={d.id}
                          value={d.name_th}
                          data-checked={d.name_th === field.value}
                          onSelect={() => {
                            field.onChange(d.name_th)
                            setValue(`${prefix}.subDistrict`, "")
                            setOpenField(null)
                          }}
                        >
                          {d.name_th}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name={`${prefix}.subDistrict`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>ตำบล/แขวง</FormLabel>
            <Popover
              open={openField === "subDistrict"}
              onOpenChange={open => setOpenField(open ? "subDistrict" : null)}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!selectedDistrict}
                    className={cn(
                      "h-8 w-full justify-between rounded-lg font-normal shadow-xs",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value || "เลือกตำบล/แขวง"}
                    <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Command>
                  <CommandInput placeholder="ค้นหาตำบล/แขวง..." />
                  <CommandList>
                    <CommandEmpty>ไม่พบตำบล/แขวง</CommandEmpty>
                    <CommandGroup>
                      {filteredSubDistricts.map(s => (
                        <CommandItem
                          key={s.id}
                          value={s.name_th}
                          data-checked={s.name_th === field.value}
                          onSelect={() => {
                            field.onChange(s.name_th)
                            setOpenField(null)
                          }}
                        >
                          {s.name_th}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
