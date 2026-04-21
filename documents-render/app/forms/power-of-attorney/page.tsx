import PowerOfAttorneyForm from "@/components/forms/power-of-attorney-form"

export default function PowerOfAttorneyPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          หนังสือมอบอำนาจ
        </h1>
        <PowerOfAttorneyForm />
      </div>
    </div>
  )
}