"use client"

import { useState, useMemo } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react"

import { generatePdf } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ThaiDatePicker, formatThaiDate } from "@/components/ui/thai-date-picker"

const itemSchema = z.object({
  name: z.string().min(1, "กรุณากรอกรายการ"),
  qty: z.number({ error: "กรุณากรอกจำนวน" }).positive("ต้องมากกว่า 0"),
  price: z.number({ error: "กรุณากรอกราคา" }).nonnegative("ต้องไม่ติดลบ"),
})

const schema = z.object({
  companyName: z.string().min(1, "กรุณากรอกชื่อบริษัท"),
  companyAddress: z.string().min(1, "กรุณากรอกที่อยู่บริษัท"),
  companyTel: z.string().min(1, "กรุณากรอกเบอร์โทร"),
  companyEmail: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  invoiceNo: z.string().min(1, "กรุณากรอกเลขที่ใบแจ้งหนี้"),
  invoiceDate: z.date({ error: "กรุณาเลือกวันที่ออก" }),
  dueDate: z.date({ error: "กรุณาเลือกวันครบกำหนด" }),
  clientName: z.string().min(1, "กรุณากรอกชื่อลูกค้า"),
  clientAddress: z.string().min(1, "กรุณากรอกที่อยู่ลูกค้า"),
  items: z.array(itemSchema).min(1, "กรุณาเพิ่มรายการอย่างน้อย 1 รายการ"),
  tax: z.number().min(0).max(100),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function calcTotals(items: { qty: number; price: number }[], taxRate: number) {
  const subtotal = items.reduce((sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0), 0)
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100
  return { subtotal, taxAmount, total }
}

export default function InvoiceForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      companyAddress: "",
      companyTel: "",
      companyEmail: "",
      invoiceNo: "",
      invoiceDate: undefined as unknown as Date,
      dueDate: undefined as unknown as Date,
      clientName: "",
      clientAddress: "",
      items: [{ name: "", qty: 1, price: 0 }],
      tax: 7,
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const watchedItems = useWatch({ control: form.control, name: "items" })
  const watchedTax = useWatch({ control: form.control, name: "tax" })

  const totals = useMemo(() => calcTotals(watchedItems ?? [], watchedTax ?? 0), [watchedItems, watchedTax])

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setError(null)
    const { subtotal, taxAmount, total } = calcTotals(values.items, values.tax)
    try {
      await generatePdf("invoice", {
        ...values,
        invoiceDate: formatThaiDate(values.invoiceDate),
        dueDate: formatThaiDate(values.dueDate),
        subtotal,
        taxAmount,
        total,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ข้อมูลบริษัท */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">ข้อมูลบริษัท</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              name="companyName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>ชื่อบริษัท</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="companyAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>ที่อยู่</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="companyTel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เบอร์โทรศัพท์</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="companyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ข้อมูลใบแจ้งหนี้ */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">ข้อมูลใบแจ้งหนี้</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              name="invoiceNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เลขที่ใบแจ้งหนี้</FormLabel>
                  <FormControl><Input placeholder="INV-2567-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่ออก</FormLabel>
                  <FormControl>
                    <ThaiDatePicker value={field.value} onChange={field.onChange} numerals="latn" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันครบกำหนดชำระ</FormLabel>
                  <FormControl>
                    <ThaiDatePicker value={field.value} onChange={field.onChange} numerals="latn" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ข้อมูลลูกค้า */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">ข้อมูลลูกค้า</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              name="clientName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>ชื่อลูกค้า / บริษัท</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="clientAddress"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>ที่อยู่</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* รายการสินค้า/บริการ */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">รายการสินค้า / บริการ</h2>

          <div className="mb-2 hidden grid-cols-[1fr_80px_110px_32px] gap-2 text-xs font-medium text-zinc-500 sm:grid">
            <span>รายการ</span>
            <span className="text-right">จำนวน</span>
            <span className="text-right">ราคา/หน่วย</span>
            <span />
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_80px_110px_32px] items-start gap-2">
                <FormField
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input placeholder="ชื่อสินค้า/บริการ" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`items.${index}.qty`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input type="number" min={1} className="text-right" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`items.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Input type="number" min={0} className="text-right" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 text-zinc-400 hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => append({ name: "", qty: 1, price: 0 })}
          >
            <PlusIcon />
            เพิ่มรายการ
          </Button>

          {/* ยอดรวม */}
          <div className="mt-4 space-y-1 border-t pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-600">ยอดก่อนภาษี</span>
              <span className="text-sm font-medium">{totals.subtotal.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600">ภาษีมูลค่าเพิ่ม</span>
                <FormField
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" min={0} max={100} className="h-6 w-16 text-right text-sm" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span className="text-sm text-zinc-600">%</span>
              </div>
              <span className="text-sm font-medium">{totals.taxAmount.toLocaleString("th-TH")} บาท</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-2">
              <span className="font-medium text-zinc-800">ยอดรวมทั้งสิ้น</span>
              <span className="text-lg font-semibold text-zinc-900">{totals.total.toLocaleString("th-TH")} บาท</span>
            </div>
          </div>
        </section>

        {/* หมายเหตุ */}
        <section className="rounded-lg border bg-white p-4 shadow-xs">
          <h2 className="mb-4 font-medium text-zinc-800">หมายเหตุ (ไม่บังคับ)</h2>
          <FormField
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="เช่น กรุณาชำระเงินภายใน 30 วัน"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
