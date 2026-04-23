"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2Icon } from "lucide-react"

import { generatePdf } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ThaiDatePicker, toThaiDateParts } from "@/components/ui/thai-date-picker"

const personSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  age: z.coerce.number().int().positive("อายุต้องมากกว่า 0"),
  ethnicity: z.string().min(1, "กรุณากรอกเชื้อชาติ"),
  nationality: z.string().min(1, "กรุณากรอกสัญชาติ"),
  houseNo: z.string().min(1, "กรุณากรอกบ้านเลขที่"),
  moo: z.string(),
  soi: z.string(),
  road: z.string(),
  subDistrict: z.string().min(1, "กรุณากรอกตำบล/แขวง"),
  district: z.string().min(1, "กรุณากรอกอำเภอ/เขต"),
  province: z.string().min(1, "กรุณากรอกจังหวัด"),
  phone: z.string().min(1, "กรุณากรอกเบอร์โทร"),
})

const schema = z.object({
  writtenAt: z.string().min(1, "กรุณากรอกสถานที่"),
  date: z.date({ error: "กรุณาเลือกวันที่" }),
  grantor: personSchema.extend({
    currentAddress: z.string().min(1, "กรุณากรอกที่อยู่ปัจจุบัน"),
  }),
  attorney: personSchema,
  powers1: z.string().min(1, "กรุณากรอกอำนาจที่มอบ"),
  powers2: z.string(),
  witness1: z.string().min(1, "กรุณากรอกชื่อพยานคนที่ 1"),
  witness2: z.string().min(1, "กรุณากรอกชื่อพยานคนที่ 2"),
})

type FormValues = z.infer<typeof schema>

function PersonFields({
  prefix,
  title,
  showCurrentAddress = false,
}: {
  prefix: "grantor" | "attorney"
  title: string
  showCurrentAddress?: boolean
}) {
  return (
    <section className="rounded-lg border bg-white p-4 shadow-xs">
      <h2 className="mb-4 font-medium text-zinc-800">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          name={`${prefix}.name`}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>ชื่อ-นามสกุล</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.age`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>อายุ (ปี)</FormLabel>
              <FormControl><Input type="number" min={1} {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>เบอร์โทรศัพท์</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.ethnicity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>เชื้อชาติ</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.nationality`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>สัญชาติ</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.houseNo`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>บ้านเลขที่</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.moo`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมู่</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.soi`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ซอย</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.road`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ถนน</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.subDistrict`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ตำบล/แขวง</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.district`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>อำเภอ/เขต</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={`${prefix}.province`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>จังหวัด</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showCurrentAddress && (
          <FormField
            name={`${prefix}.currentAddress`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>ที่อยู่ปัจจุบัน</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </section>
  )
}

export default function PowerOfAttorneyForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      writtenAt: "",
      date: undefined as unknown as Date,
      grantor: { name: "", age: "" as unknown as number, ethnicity: "ไทย", nationality: "ไทย", houseNo: "", moo: "", soi: "", road: "", subDistrict: "", district: "", province: "", phone: "", currentAddress: "" },
      attorney: { name: "", age: "" as unknown as number, ethnicity: "ไทย", nationality: "ไทย", houseNo: "", moo: "", soi: "", road: "", subDistrict: "", district: "", province: "", phone: "" },
      powers1: "",
      powers2: "",
      witness1: "",
      witness2: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setError(null)
    try {
      const { day, month, year } = toThaiDateParts(values.date)
      await generatePdf("power-of-attorney", { ...values, day, month, year })
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ข้อมูลเอกสาร */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">ข้อมูลเอกสาร</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              name="writtenAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เขียนที่</FormLabel>
                  <FormControl><Input placeholder="เช่น กรุงเทพมหานคร" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่ทำเอกสาร</FormLabel>
                  <FormControl>
                    <ThaiDatePicker value={field.value} onChange={field.onChange} numerals="latn" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <PersonFields prefix="grantor" title="ผู้มอบอำนาจ" showCurrentAddress />
        <PersonFields prefix="attorney" title="ผู้รับมอบอำนาจ" />

        {/* อำนาจที่มอบ */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">อำนาจที่มอบ</h2>
          <div className="grid gap-3">
            <FormField
              name="powers1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียดอำนาจที่มอบ (บรรทัดที่ 1)</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="powers2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียดอำนาจที่มอบ (บรรทัดที่ 2) — ไม่บังคับ</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* พยาน */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">พยาน</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              name="witness1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>พยานคนที่ 1</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="witness2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>พยานคนที่ 2</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
          {loading && <Loader2Icon className="animate-spin" />}
          {loading ? "กำลังสร้าง PDF..." : "สร้าง PDF"}
        </Button>
      </form>
    </Form>
  )
}
