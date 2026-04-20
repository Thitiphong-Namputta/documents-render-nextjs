import PdfViewerWrapper from "@/components/pdf/viewer-wrapper";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800">Invoice Preview</h1>
        <PdfViewerWrapper url="/pdfs/invoice-sample.pdf" />
      </div>
    </main>
  );
}
