import Link from "next/link"
import {
  FileTextIcon,
  ScrollTextIcon,
  FileSignatureIcon,
  BookOpenIcon,
  AwardIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  BarChart3Icon,
  FileBadgeIcon,
} from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTemplatesServer } from "@/lib/api"
import type { Template } from "@/lib/api"
import { formRegistry } from "@/components/forms/form-registry"

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  "invoice": FileTextIcon,
  "power-of-attorney": ScrollTextIcon,
  "power-of-attorney-multi": FileSignatureIcon,
  "contract": BookOpenIcon,
  "certificate": AwardIcon,
  "petition": ClipboardListIcon,
  "certification": FileBadgeIcon,
  "job-application": BriefcaseIcon,
  "report": BarChart3Icon,
}

function getIcon(id: string): React.ElementType {
  return TEMPLATE_ICONS[id] ?? FileTextIcon
}

export default async function FormsPage() {
  const templates = await getTemplatesServer(
    process.env.BACKEND_URL ?? "http://localhost:5000"
  )

  return (
    <div className="py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          เลือกประเภทเอกสาร
        </h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t: Template) => {
            const Icon = getIcon(t.id)
            const hasForm = t.id in formRegistry
            return (
              <TemplateCard
                key={t.id}
                template={t}
                icon={Icon}
                hasForm={hasForm}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  icon: Icon,
  hasForm,
}: {
  template: Template
  icon: React.ElementType
  hasForm: boolean
}) {
  const content = (
    <Card className="h-full transition-shadow group-hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Icon className="size-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <CardTitle className="flex items-center gap-2 text-base">
          {template.titleTh}
          {!hasForm && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-normal text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              เร็ว ๆ นี้
            </span>
          )}
        </CardTitle>
        <CardDescription>{template.descriptionTh}</CardDescription>
      </CardHeader>
    </Card>
  )

  if (!hasForm) {
    return <div className="cursor-not-allowed opacity-60">{content}</div>
  }

  return (
    <Link href={`/forms/${template.id}`} className="group">
      {content}
    </Link>
  )
}
