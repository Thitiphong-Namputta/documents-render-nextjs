"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { SignaturePosition, SignaturePositionsResult } from "@/lib/api";
import styles from "./viewer.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function SigOverlay({ sig, scale }: { sig: SignaturePosition; scale: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--sig-x", `${sig.x * scale}px`);
    el.style.setProperty("--sig-y", `${sig.y * scale}px`);
    el.style.setProperty("--sig-w", `${sig.width * scale}px`);
    el.style.setProperty("--sig-h", `${sig.height * scale}px`);
  }, [sig, scale]);

  return (
    <div ref={ref} className={styles.sigOverlay}>
      <span className={styles.sigLabel}>{sig.label}</span>
    </div>
  );
}

interface PdfViewerProps {
  url: string;
  sigPositions?: SignaturePositionsResult | null;
}

export default function PdfViewer({ url, sigPositions }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidthPx, setPageWidthPx] = useState<number | null>(null);
  const firstPageRef = useRef<HTMLDivElement>(null);

  const scale =
    pageWidthPx && sigPositions ? pageWidthPx / sigPositions.pageWidth : null;

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from({ length: numPages }, (_, i) => {
          const pageNum = i + 1;
          return (
            <div
              key={pageNum}
              ref={i === 0 ? firstPageRef : undefined}
              className="relative mb-4 shadow-md"
            >
              <Page
                pageNumber={pageNum}
                onRenderSuccess={() => {
                  if (i === 0 && firstPageRef.current && !pageWidthPx) {
                    const canvas = firstPageRef.current.querySelector("canvas");
                    if (canvas) setPageWidthPx(canvas.offsetWidth);
                  }
                }}
              />
              {scale &&
                sigPositions?.signatures
                  .filter((sig) => sig.page === pageNum)
                  .map((sig, idx) => (
                    <SigOverlay key={`${sig.id}-${idx}`} sig={sig} scale={scale} />
                  ))}
            </div>
          );
        })}
      </Document>
    </div>
  );
}
