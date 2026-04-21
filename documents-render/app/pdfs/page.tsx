import fs from "fs"
import path from "path"
import PdfTable from "@/components/pdf/pdf-table"

export default function PdfsPage() {
  const pdfsDir = path.join(process.cwd(), "public/pdfs")
  const files = fs.readdirSync(pdfsDir).filter((f) => f.endsWith(".pdf"))

  const pdfs = files.map((name) => {
    const stat = fs.statSync(path.join(pdfsDir, name))
    return {
      name,
      path: `/pdfs/${name}`,
      sizeKB: Math.round((stat.size / 1024) * 10) / 10,
      lastModified: stat.mtime.toLocaleDateString("th-TH"),
    }
  })

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          รายการเอกสาร PDF
        </h1>
        <div className="rounded-lg border bg-white shadow-sm dark:bg-zinc-800">
          <PdfTable pdfs={pdfs} />
        </div>
      </div>
    </div>
  )
}