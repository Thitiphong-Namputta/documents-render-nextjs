import InvoiceForm from "@/components/forms/invoice-form"

export default function InvoicePage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          ใบแจ้งหนี้
        </h1>
        <InvoiceForm />
      </div>
    </div>
  )
}