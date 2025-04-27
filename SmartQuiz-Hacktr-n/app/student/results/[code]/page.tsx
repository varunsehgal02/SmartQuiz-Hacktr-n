"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Home } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import React from "react"

interface PageParams {
  code: string;
}

export default function StudentResultsPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  const [studentName, setStudentName] = useState("")
  const [quizData, setQuizData] = useState<any>(null)
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 })

  useEffect(() => {
    // Get student name from localStorage
    const name = localStorage.getItem("studentName")
    if (name) {
      setStudentName(name)
    }

    // Get quiz data
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      setQuizData(JSON.parse(storedQuiz))
    }

    // In a real app, we would get the actual score from the server
    // For demo purposes, generate a random score
    const totalQuestions = JSON.parse(storedQuiz || '{"questions":[]}').questions.length
    const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1))
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)

    setScore({
      correct: correctAnswers,
      total: totalQuestions,
      percentage,
    })

    // Trigger confetti effect
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    setTimeout(triggerConfetti, 500)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-2xl">SmartQuiz Architect</span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>Great job completing the quiz, {studentName}!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative w-32 h-32 mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-3xl font-bold">{score.percentage}%</span>
                </div>
                <svg className="absolute inset-0" width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="60" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={Math.PI * 2 * 60}
                    strokeDashoffset={Math.PI * 2 * 60 * (1 - score.percentage / 100)}
                    initial={{ strokeDashoffset: Math.PI * 2 * 60 }}
                    animate={{ strokeDashoffset: Math.PI * 2 * 60 * (1 - score.percentage / 100) }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
              </motion.div>

              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-1">Your Score</h3>
                <p className="text-gray-500">
                  You got {score.correct} out of {score.total} questions correct.
                </p>
              </div>

              <div className="w-full bg-gray-100 p-4 rounded-md text-center">
                <p className="text-gray-600">
                  {score.percentage >= 80
                    ? "Excellent work! You've mastered this topic."
                    : score.percentage >= 60
                      ? "Good job! You have a solid understanding of the material."
                      : "Keep practicing! You'll improve with more study."}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
