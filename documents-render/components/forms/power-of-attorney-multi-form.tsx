"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react"

import { generatePdf, getSignaturePositions, type SignaturePositionsResult } from "@/lib/api"
import PdfViewerWrapper from "@/components/pdf/viewer-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ThaiDatePicker, toThaiDateParts } from "@/components/ui/thai-date-picker"
import { ThaiAddressFields } from "@/components/ui/thai-address-fields"

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
  grantors: z.array(
    personSchema.extend({
      currentAddress: z.string().min(1, "กรุณากรอกที่อยู่ปัจจุบัน"),
    })
  ).min(1),
  attorneys: z.array(personSchema).min(1),
  powers1: z.string().min(1, "กรุณากรอกอำนาจที่มอบ"),
  powers2: z.string(),
  witness1: z.string().min(1, "กรุณากรอกชื่อพยานคนที่ 1"),
  witness2: z.string().min(1, "กรุณากรอกชื่อพยานคนที่ 2"),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.infer<typeof schema>


const DEFAULT_GRANTOR = {
  name: "", age: "", ethnicity: "ไทย", nationality: "ไทย",
  houseNo: "", moo: "", soi: "", road: "",
  subDistrict: "", district: "", province: "", phone: "", currentAddress: "",
}
const DEFAULT_ATTORNEY = {
  name: "", age: "", ethnicity: "ไทย", nationality: "ไทย",
  houseNo: "", moo: "", soi: "", road: "",
  subDistrict: "", district: "", province: "", phone: "",
}

function PersonFields({
  prefix,
  showCurrentAddress = false,
}: {
  prefix: string
  showCurrentAddress?: boolean
}) {
  return (
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
            <FormControl><Input type="number" min={1} {...field} /></FormControl>
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
      <ThaiAddressFields prefix={prefix} />
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
  )
}

export default function PowerOfAttorneyMultiForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [sigPositions, setSigPositions] = useState<SignaturePositionsResult | null>(null)

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      writtenAt: "",
      date: undefined as unknown as Date,
      grantors: [DEFAULT_GRANTOR],
      attorneys: [DEFAULT_ATTORNEY],
      powers1: "",
      powers2: "",
      witness1: "",
      witness2: "",
    },
  })

  const {
    fields: grantorFields,
    append: appendGrantor,
    remove: removeGrantor,
  } = useFieldArray({ control: form.control, name: "grantors" })

  const {
    fields: attorneyFields,
    append: appendAttorney,
    remove: removeAttorney,
  } = useFieldArray({ control: form.control, name: "attorneys" })

  async function onSubmit(values: FormOutput) {
    setLoading(true)
    setError(null)
    try {
      const { day, month, year } = toThaiDateParts(values.date)
      const payload = { ...values, day, month, year }
      const [url, sigResult] = await Promise.all([
        generatePdf("power-of-attorney-multi", payload),
        getSignaturePositions("power-of-attorney-multi", payload),
      ])
      setPdfUrl(url)
      setSigPositions(sigResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ข้อมูลเอกสาร */}
        <section className="rounded-lg border bg-white p-4 shadow-xs dark:bg-zinc-950">
          <h2 className="mb-4 font-medium text-zinc-800 dark:text-zinc-100">ข้อมูลเอกสาร</h2>
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

        {/* ผู้มอบอำนาจ (array) */}
        <section className="rounded-lg border bg-white p-4 shadow-xs dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-100">
              ผู้มอบอำนาจ
              <span className="ml-2 text-sm font-normal text-zinc-500">({grantorFields.length} คน)</span>
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendGrantor(DEFAULT_GRANTOR)}
            >
              <PlusIcon className="size-3.5" />
              เพิ่มผู้มอบอำนาจ
            </Button>
          </div>
          <div className="space-y-4">
            {grantorFields.map((field, index) => (
              <div key={field.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    ผู้มอบอำนาจคนที่ {index + 1}
                  </span>
                  {grantorFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeGrantor(index)}
                    >
                      <Trash2Icon className="size-3.5" />
                      ลบ
                    </Button>
                  )}
                </div>
                <PersonFields prefix={`grantors.${index}`} showCurrentAddress />
              </div>
            ))}
          </div>
        </section>

        {/* ผู้รับมอบอำนาจ (array) */}
        <section className="rounded-lg border bg-white p-4 shadow-xs dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-100">
              ผู้รับมอบอำนาจ
              <span className="ml-2 text-sm font-normal text-zinc-500">({attorneyFields.length} คน)</span>
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAttorney(DEFAULT_ATTORNEY)}
            >
              <PlusIcon className="size-3.5" />
              เพิ่มผู้รับมอบอำนาจ
            </Button>
          </div>
          <div className="space-y-4">
            {attorneyFields.map((field, index) => (
              <div key={field.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    ผู้รับมอบอำนาจคนที่ {index + 1}
                  </span>
                  {attorneyFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeAttorney(index)}
                    >
                      <Trash2Icon className="size-3.5" />
                      ลบ
                    </Button>
                  )}
                </div>
                <PersonFields prefix={`attorneys.${index}`} />
              </div>
            ))}
          </div>
        </section>

        {/* อำนาจที่มอบ */}
        <section className="rounded-lg border bg-white p-4 shadow-xs dark:bg-zinc-950">
          <h2 className="mb-4 font-medium text-zinc-800 dark:text-zinc-100">อำนาจที่มอบ</h2>
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
        <section className="rounded-lg border bg-white p-4 shadow-xs dark:bg-zinc-950">
          <h2 className="mb-4 font-medium text-zinc-800 dark:text-zinc-100">พยาน</h2>
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

    {pdfUrl && (
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          ผลลัพธ์ PDF
        </h2>
        <PdfViewerWrapper url={pdfUrl} sigPositions={sigPositions} />
      </div>
    )}
    </>
  )
}
