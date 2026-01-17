"use client"

import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"

interface ImportExportButtonsProps {
  onImport: () => void
  onExport: () => void
  hasData: boolean
}

export function ImportExportButtons({ onImport, onExport, hasData }: ImportExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onImport}>
        <Upload className="mr-2 h-4 w-4" />
        匯入 HTML
      </Button>
      <Button onClick={onExport} disabled={!hasData}>
        <Download className="mr-2 h-4 w-4" />
        匯出 HTML
      </Button>
    </div>
  )
}
