import Link from "next/link"
import { FileTextIcon, ScrollTextIcon } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const forms = [
  {
    href: "/forms/power-of-attorney",
    icon: ScrollTextIcon,
    title: "หนังสือมอบอำนาจ",
    description: "มอบอำนาจให้บุคคลอื่นดำเนินการแทนในเรื่องต่าง ๆ",
  },
  {
    href: "/forms/invoice",
    icon: FileTextIcon,
    title: "ใบแจ้งหนี้",
    description: "ออกใบแจ้งหนี้พร้อมรายการสินค้าและคำนวณยอดรวม",
  },
]

export default function FormsPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          เลือกประเภทเอกสาร
        </h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {forms.map(({ href, icon: Icon, title, description }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Icon className="size-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}