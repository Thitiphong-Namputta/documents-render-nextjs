import { notFound } from "next/navigation"
import { formRegistry } from "@/components/forms/form-registry"
import { getTemplatesServer } from "@/lib/api"

export default async function FormPage({
  params,
}: {
  params: Promise<{ template: string }>
}) {
  const { template } = await params

  const FormComponent = formRegistry[template]
  if (!FormComponent) {
    notFound()
  }

  const templates = await getTemplatesServer(
    process.env.BACKEND_URL ?? "http://localhost:5000"
  )
  const meta = templates.find((t) => t.id === template)
  const title = meta?.titleTh ?? template

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </h1>
        <FormComponent />
      </div>
    </div>
  )
}
