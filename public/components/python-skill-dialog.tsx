"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface PythonSkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLevelSelected?: (level: number) => void
}

export function PythonSkillDialog({ open, onOpenChange, onLevelSelected }: PythonSkillDialogProps) {
  const [skillLevel, setSkillLevel] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!skillLevel) return

    setIsSubmitting(true)
    const level = Number.parseInt(skillLevel)

    try {
      if (onLevelSelected) onLevelSelected(level)

      // if (level === 1) router.push("/docs/basics/numbers")
      // else if (level === 2) router.push("/docs/basics/variables")
      // else if (level === 3) router.push("/lobby")
      router.push("/docs")

      onOpenChange(false) // Only allow closing after submission
    } catch (error) {
      console.error("Error setting user level:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {}} // disable external close
    >
        <DialogContent
          className="sm:max-w-[500px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
        <DialogHeader>
          <DialogTitle>*จำเป็น* เลือกระดับ Python ของคุณก่อนจะไปต่อ</DialogTitle>
          <DialogDescription>
            ช่วยให้เราสามารถแนะนำเนื้อหาที่เหมาะสมกับระดับทักษะของคุณได้
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={skillLevel || ""} onValueChange={setSkillLevel}>
            <div className="flex items-start space-x-2 mb-4">
              <RadioGroupItem value="1" id="beginner" className="mt-1 text-green-500" />
              <div>
                <Label htmlFor="beginner" className="font-medium text-green-500">
                  มือใหม่ หัดเขียน
                </Label>
                <p className="text-sm text-muted-foreground">
                  เริ่มต้นจาก 0 ไม่เคยเขียน Python มาก่อน
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 mb-4">
              <RadioGroupItem value="2" id="intermediate" className="mt-1 text-yellow-500" />
              <div>
                <Label htmlFor="intermediate" className="font-medium text-yellow-500">
                  ปานกลาง พอตัว
                </Label>
                <p className="text-sm text-muted-foreground">
                  เข้าใจพื้นฐาน Python แล้ว แต่ต้องการเรียนรู้เพิ่มเติม
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="3" id="advanced" className="mt-1 text-red-500" />
              <div>
                <Label htmlFor="advanced" className="font-medium text-red-500">
                  โหดมาก ของแท้
                </Label>
                <p className="text-sm text-muted-foreground">
                  มีประสบการณ์ในการเขียน Python มาพอสมควร
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!skillLevel || isSubmitting}>
            {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
