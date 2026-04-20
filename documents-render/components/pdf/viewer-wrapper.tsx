"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./viewer"), { ssr: false });

export default function PdfViewerWrapper({ url }: { url: string }) {
  return <PdfViewer url={url} />;
}
