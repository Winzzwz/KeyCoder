"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons"

interface TagButtonProps {
  tag: string
  variant?: "default" | "secondary" | "outline"
  size?: "sm" | "default" | "lg"
  className?: string
}

const tagDocumentationMap: Record<string, string> = {
  ตัวแปร: "/docs/basics/variables",
  ลูป: "/docs/basics/loops",
  เงื่อนไข: "/docs/basics/conditionals",
  ฟังก์ชัน: "/docs/basics/functions",
  สตริง: "/docs/basics/strings",
  อาร์เรย์: "/docs/basics/arrays",
  เลข: "/docs/basics/numbers",
  ไวยากรณ์: "/docs/basics/syntax",
  ตัวดำเนินการ: "/docs/basics/operators",
  ประเภทข้อมูล: "/docs/basics/datatypes",
}

export function TagButton({ tag, variant = "secondary", size = "sm", className = "" }: TagButtonProps) {
  const [open, setOpen] = useState(false)

  const handleGoToDocumentation = () => {
    const docUrl = tagDocumentationMap[tag]
    if (docUrl) {
      // Open in new tab
      window.open(docUrl, "_blank", "noopener,noreferrer")
    }
    setOpen(false)
  }

  const hasDocumentation = tag in tagDocumentationMap

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${className} ${hasDocumentation ? "cursor-pointer hover:bg-primary/20" : "cursor-default"}`}
          disabled={!hasDocumentation}
        >
          <Badge variant="outline" className="text-xs">
            {tag}
          </Badge>
        </Button>
      </DialogTrigger>
      {hasDocumentation && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>เรียนรู้เพิ่มเติมเกี่ยวกับ {tag}</DialogTitle>
            <DialogDescription>คุณต้องการดูเอกสารประกอบเกี่ยวกับหัวข้อ "{tag}" หรือไม่?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleGoToDocumentation}>
              <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 h-4 w-4" />
              ดูเอกสาร (เปิดแท็บใหม่)
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
