import PdfViewerWrapper from "@/components/pdf/viewer-wrapper"

export default function Home() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          ตัวอย่างเอกสาร PDF
        </h1>
        <PdfViewerWrapper url="/pdfs/text-sample-2.pdf" />
      </div>
    </div>
  )
}