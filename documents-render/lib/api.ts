export interface SignaturePosition {
  id: string
  label: string
  page: number
  x: number
  y: number
  width: number
  height: number
}

export interface SignaturePositionsResult {
  pageCount: number
  pageWidth: number
  pageHeight: number
  signatures: SignaturePosition[]
}

export async function getSignaturePositions(
  type: string,
  data?: unknown
): Promise<SignaturePositionsResult> {
  const res = await fetch("/api/v1/pdf/signature-positions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "เกิดข้อผิดพลาด" }))
    throw new Error(err.message ?? "เกิดข้อผิดพลาดในการดึงตำแหน่งลายเซ็น")
  }

  const json = await res.json()
  return json.data as SignaturePositionsResult
}

export async function generatePdf(type: string, data: unknown): Promise<void> {
  const res = await fetch("/api/v1/pdf/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "เกิดข้อผิดพลาด" }))
    throw new Error(err.message ?? "เกิดข้อผิดพลาดในการสร้าง PDF")
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
