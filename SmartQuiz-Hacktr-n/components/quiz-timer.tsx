"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface QuizTimerProps {
  duration: number
  onTimerEnd: () => void
}

export function QuizTimer({ duration, onTimerEnd }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerEnd()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimerEnd])

  useEffect(() => {
    // Reset timer when duration changes
    setTimeLeft(duration)
  }, [duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    const percentage = (timeLeft / duration) * 100
    if (percentage > 50) return "text-emerald-600"
    if (percentage > 25) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={Math.PI * 2 * 45}
            strokeDashoffset={Math.PI * 2 * 45 * (1 - timeLeft / duration)}
            className={getTimerColor()}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: Math.PI * 2 * 45 * (1 - timeLeft / duration) }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getTimerColor()}`}>{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  )
}
