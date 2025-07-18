"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface CourseProgressProps {
  userLevel: number
  currentCourse: number
  completedCourses: number[]
}

const levelNames = {
  0: "ยังไม่ได้เลือก",
  1: "มือใหม่ หัดเขียน",
  2: "ปานกลาง พอตัว",
  3: "โหดมาก ของแท้",
}

const levelColors = {
  0: "bg-white-500",
  1: "bg-green-500",
  2: "bg-yellow-500",
  3: "bg-purple-500",
}

export function CourseProgress({ userLevel, currentCourse, completedCourses }: CourseProgressProps) {
  const getRequiredCourses = () => {
    // if (userLevel === 1) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 11] // All 10 courses
    // if (userLevel === 2) return [5, 6, 7, 8, 9, 10, 11] // Last 6 courses (from Numbers onwards)
    // if (userLevel === 3) return [] // No courses required
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  }
  // console.log(userLevel, currentCourse, completedCourses)

  const requiredCourses = getRequiredCourses()
  const totalRequired = requiredCourses.length
  const completedRequired = completedCourses.filter((course) => requiredCourses.includes(course)).length
  const progressPercentage = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 100

  if (userLevel === 3) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Badge className="bg-purple-500 text-white">{levelNames[userLevel as keyof typeof levelNames]}</Badge>
        </div>
        <p className="text-sm text-purple-300">คุณสามารถเข้าเกมได้ทันที! ไม่จำเป็นต้องเรียนคอร์สใดๆ</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white-800/50 border border-white-700 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge className={`${levelColors[userLevel as keyof typeof levelColors]} text-white`}>
          {levelNames[userLevel as keyof typeof levelNames]}
        </Badge>
        <span className="text-sm text-white-400">
          {completedRequired}/{totalRequired}
        </span>
      </div>

      <div className="mb-3">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="space-y-1">
        <p className="text-sm text-white-300">ความคืบหน้า: {Math.round(progressPercentage)}%</p>
        {totalRequired > completedRequired && (
          <p className="text-xs text-white-400">เหลืออีก {totalRequired - completedRequired} คอร์สเพื่อปลดล็อกเกม</p>
        )}
        {completedRequired === totalRequired && <p className="text-xs text-green-400">🎉 เสร็จสิ้นแล้ว! สามารถเข้าเกมได้</p>}
      </div>
    </motion.div>
  )
}
