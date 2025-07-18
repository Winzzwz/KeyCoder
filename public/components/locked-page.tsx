"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PageLockNoticeProps {
  open: boolean
}

interface PageLockNoticeProps {
  open: boolean
  onBypass: () => void
}

export function PageLockNotice({ open }: PageLockNoticeProps) {
  const router = useRouter()

  const handleRedirect = () => {
    router.push("/docs")
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>🔒 หน้านี้ถูกล็อกอยู่</DialogTitle>
          <DialogDescription>
            หน้านี้จะใช้งานได้หลังจากคุณเรียนจบ <b>“คอร์ส Python เบื้องต้น”</b> แล้วเท่านั้น
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button onClick={handleRedirect} className="bg-purple-600 text-white hover:bg-purple-700">
            ไปยัง <b>คอร์ส Python เบื้องต้น</b>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
