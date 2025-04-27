"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { BloomsTaxonomyBadge } from "@/components/blooms-taxonomy-badge"
import { QuizTimer } from "@/components/quiz-timer"
import { FullscreenWarning } from "@/components/fullscreen-warning"
import confetti from "canvas-confetti"
import Link from "next/link"
import { Maximize } from "lucide-react"
import React from "react"

interface PageParams {
  code: string;
}

export default function StudentSelfQuizPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  const router = useRouter()
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 })
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get self-quiz parameters from localStorage
    const selfQuizParams = localStorage.getItem("selfQuizParams")

    if (selfQuizParams) {
      const params = JSON.parse(selfQuizParams)

      // Generate mock quiz data based on the parameters
      const mockQuiz = generateMockSelfQuiz(params)
      setQuizData(mockQuiz)
    }

    setIsLoading(false)

    // Add fullscreen change event listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      // Only show warning if quiz has started and user exits fullscreen
      if (quizStarted && !document.fullscreenElement) {
        setShowFullscreenWarning(true)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [quizStarted])

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
        setQuizStarted(true)
        setShowFullscreenWarning(false)
      }
    } catch (error) {
      console.error("Error attempting to enable fullscreen:", error)
      // If fullscreen fails, still allow the quiz to start
      setQuizStarted(true)
    }
  }

  const currentQuestion = quizData?.questions[currentQuestionIndex]

  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return

    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Quiz complete - calculate score
      let correctCount = 0

      quizData.questions.forEach((question: any) => {
        const userAnswer = answers[question.id]

        if (question.type === "mcq" && userAnswer === question.answer.toString()) {
          correctCount++
        } else if (question.type === "true-false" && userAnswer === question.answer.toString()) {
          correctCount++
        } else if (
          (question.type === "short-answer" || question.type === "fill-in-blank") &&
          userAnswer &&
          userAnswer.toLowerCase() === question.answer.toLowerCase()
        ) {
          correctCount++
        }
      })

      const percentage = Math.round((correctCount / quizData.questions.length) * 100)

      setScore({
        correct: correctCount,
        total: quizData.questions.length,
        percentage,
      })

      setQuizComplete(true)

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }

      // Trigger confetti if score is good
      if (percentage >= 70) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }, 500)
      }
    }
  }

  const handleTimerEnd = () => {
    // Automatically move to the next question when timer ends
    handleNextQuestion()
  }

  const getTimerDuration = () => {
    if (!quizData || !currentQuestion) return 60

    // Set timer based on difficulty
    const difficultyMap = {
      easy: 45,
      medium: 60,
      hard: 90,
    }

    return difficultyMap[quizData.difficulty as keyof typeof difficultyMap] || 60
  }

  // Function to generate mock quiz data based on parameters
  const generateMockSelfQuiz = (params: any) => {
    const { topic, numQuestions, difficulty, bloomsLevel, questionType } = params

    const questions = []

    for (let i = 0; i < numQuestions; i++) {
      // Determine question type
      let type = questionType
      if (type === "mixed") {
        const types = ["mcq", "fill-in-blank", "short-answer"]
        type = types[Math.floor(Math.random() * types.length)]
      }

      const question: any = {
        id: `q-${i + 1}`,
        type,
        question: `Sample ${type} question ${i + 1} about ${topic}?`,
        explanation: `This is an explanation for question ${i + 1}.`,
        bloomsLevel,
      }

      if (type === "mcq") {
        question.options = [
          `Option A for question ${i + 1}`,
          `Option B for question ${i + 1}`,
          `Option C for question ${i + 1}`,
          `Option D for question ${i + 1}`,
        ]
        question.answer = "0" // Index of correct option as string
      } else if (type === "true-false") {
        question.answer = Math.random() > 0.5 ? "true" : "false"
      } else if (type === "short-answer") {
        question.answer = `Answer ${i + 1}`
      } else if (type === "fill-in-blank") {
        question.answer = `Word${i + 1}`
      }

      questions.push(question)
    }

    return {
      title: `Self-Practice Quiz on ${topic}`,
      description: `A ${difficulty} difficulty self-practice quiz on ${topic} focusing on ${bloomsLevel} level.`,
      difficulty,
      questions,
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your practice quiz...</p>
        </div>
      </div>
    )
  }

  if (!quizData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (quizComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Practice Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative w-32 h-32 mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 text-3xl font-bold">{score.percentage}%</span>
                </div>
                <svg className="absolute inset-0" width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="60" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="#9333ea"
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
            <CardFooter className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                <Link href="#" onClick={() => window.location.reload()}>
                  Practice Again
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">{quizData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You're about to start a practice quiz with {quizData.questions.length} questions.</p>
            <Alert className="mb-4">
              <AlertDescription>
                This quiz works best in fullscreen mode. Click the button below to start in fullscreen.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={enterFullscreen} className="bg-purple-600 hover:bg-purple-700">
              <Maximize className="mr-2 h-4 w-4" />
              Start Quiz in Fullscreen
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50 py-8 px-4">
      {showFullscreenWarning && (
        <FullscreenWarning
          onRequestFullscreen={() => {
            document.documentElement
              .requestFullscreen()
              .then(() => setShowFullscreenWarning(false))
              .catch((err) => console.error("Error entering fullscreen:", err))
          }}
        />
      )}

      {!showFullscreenWarning && (
        <div className="container max-w-3xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{quizData.title}</h1>
              <p className="text-gray-500">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </p>
            </div>

            <QuizTimer duration={getTimerDuration()} onTimerEnd={handleTimerEnd} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  {currentQuestion.bloomsLevel && (
                    <div className="mb-2">
                      <BloomsTaxonomyBadge level={currentQuestion.bloomsLevel} />
                    </div>
                  )}
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentQuestion.type === "mcq" && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id]}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-gray-50"
                        >
                          <RadioGroupItem
                            value={optIndex.toString()}
                            id={`q${currentQuestionIndex}-option-${optIndex}`}
                          />
                          <Label
                            htmlFor={`q${currentQuestionIndex}-option-${optIndex}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === "true-false" && (
                    <RadioGroup
                      value={answers[currentQuestion.id]}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-gray-50">
                        <RadioGroupItem value="true" id={`q${currentQuestionIndex}-true`} />
                        <Label htmlFor={`q${currentQuestionIndex}-true`} className="flex-1 cursor-pointer">
                          True
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-gray-50">
                        <RadioGroupItem value="false" id={`q${currentQuestionIndex}-false`} />
                        <Label htmlFor={`q${currentQuestionIndex}-false`} className="flex-1 cursor-pointer">
                          False
                        </Label>
                      </div>
                    </RadioGroup>
                  )}

                  {currentQuestion.type === "short-answer" && (
                    <Textarea
                      placeholder="Write your answer here..."
                      className="h-32"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                  )}

                  {currentQuestion.type === "fill-in-blank" && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>Fill in the blank with the correct answer.</AlertDescription>
                      </Alert>
                      <Input
                        placeholder="Your answer..."
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                  <Button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-purple-700">
                    {currentQuestionIndex < quizData.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
