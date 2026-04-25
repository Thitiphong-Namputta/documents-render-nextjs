"use client";

import dynamic from "next/dynamic";
import type { SignaturePositionsResult } from "@/lib/api";

const PdfViewer = dynamic(() => import("./viewer"), { ssr: false });

export default function PdfViewerWrapper({
  url,
  sigPositions,
}: {
  url: string;
  sigPositions?: SignaturePositionsResult | null;
}) {
  return <PdfViewer url={url} sigPositions={sigPositions} />;
}
