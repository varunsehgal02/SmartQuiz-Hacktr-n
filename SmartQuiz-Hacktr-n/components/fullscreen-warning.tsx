"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Maximize } from "lucide-react"

interface FullscreenWarningProps {
  onRequestFullscreen: () => void
}

export function FullscreenWarning({ onRequestFullscreen }: FullscreenWarningProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center"
      >
        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Maximize className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Fullscreen Required</h2>
        <p className="text-gray-600 mb-6">
          Please return to fullscreen mode to continue the quiz. This helps maintain academic integrity.
        </p>
        <Button onClick={onRequestFullscreen} className="bg-emerald-600 hover:bg-emerald-700">
          Enter Fullscreen
        </Button>
      </motion.div>
    </div>
  )
}
