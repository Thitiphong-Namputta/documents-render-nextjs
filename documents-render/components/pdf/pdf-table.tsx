"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface PdfFile {
  name: string
  path: string
  sizeKB: number
  lastModified: string
}

export default function PdfTable({ pdfs }: { pdfs: PdfFile[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>ชื่อไฟล์</TableHead>
          <TableHead>ขนาด</TableHead>
          <TableHead>วันที่แก้ไข</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pdfs.map((pdf, index) => (
          <TableRow key={pdf.name}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            <TableCell className="font-medium">{pdf.name}</TableCell>
            <TableCell className="text-muted-foreground">{pdf.sizeKB} KB</TableCell>
            <TableCell className="text-muted-foreground">{pdf.lastModified}</TableCell>
            <TableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={pdf.path} target="_blank" rel="noopener noreferrer">
                  ดู PDF
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
