"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"

interface BloomsTaxonomyBadgeProps {
  level: BloomLevel
}

export function BloomsTaxonomyBadge({ level }: BloomsTaxonomyBadgeProps) {
  const levelConfig = {
    remember: {
      color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      label: "Remember",
    },
    understand: {
      color: "bg-green-100 text-green-800 hover:bg-green-100",
      label: "Understand",
    },
    apply: {
      color: "bg-teal-100 text-teal-800 hover:bg-teal-100",
      label: "Apply",
    },
    analyze: {
      color: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      label: "Analyze",
    },
    evaluate: {
      color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      label: "Evaluate",
    },
    create: {
      color: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      label: "Create",
    },
  }

  const config = levelConfig[level] || levelConfig.understand

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Badge variant="outline" className={`${config.color} font-medium`}>
        🧠 {config.label}
      </Badge>
    </motion.div>
  )
}
