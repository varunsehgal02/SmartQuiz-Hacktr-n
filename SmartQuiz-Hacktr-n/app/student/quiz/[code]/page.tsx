"use client"

import Link from "next/link"

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
import { Maximize } from "lucide-react"
import React from "react"
import { AntiCheatTracker } from "@/components/anti-cheat-tracker"

interface PageParams {
  code: string;
}

export default function StudentQuizPage({ params }: { params: PageParams }) {
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
  const [studentId, setStudentId] = useState<string>("")
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get student ID from localStorage
    const currentStudentId = localStorage.getItem("currentStudentId")
    if (currentStudentId) {
      setStudentId(currentStudentId)
    }
    
    // In a real app, this would fetch the quiz data from an API
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      const quiz = JSON.parse(storedQuiz)

      // If randomizeQuestions is enabled, shuffle the questions
      if (quiz.settings?.randomizeQuestions) {
        quiz.questions = [...quiz.questions].sort(() => Math.random() - 0.5)
      }

      setQuizData(quiz)
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
      // Quiz complete
      setQuizComplete(true)

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }

      // In a real app, this would submit the answers to the server
      setTimeout(() => {
        router.push(`/student/results/${resolvedParams.code}`)
      }, 3000)
    }
  }

  const handleTimerEnd = () => {
    // Automatically move to the next question when timer ends
    handleNextQuestion()
  }

  const getTimerDuration = () => {
    if (!quizData || !currentQuestion) return 60

    const { settings } = quizData

    if (settings?.timerMode === "manual" && settings?.manualTimerSeconds) {
      return settings.manualTimerSeconds
    }

    // Automatic timer based on difficulty
    const difficultyMap = {
      easy: 45,
      medium: 60,
      hard: 90,
    }

    return difficultyMap[quizData.difficulty as keyof typeof difficultyMap] || 60
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading quiz...</p>
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
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-gray-500">Your answers have been submitted.</p>
          <div className="mt-4">
            <div className="animate-pulse flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Redirecting to results...</p>
          </div>
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
            <p className="mb-4">You're about to start a quiz with {quizData.questions.length} questions.</p>
            <Alert className="mb-4">
              <AlertDescription>
                This quiz works best in fullscreen mode. Click the button below to start in fullscreen.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={enterFullscreen} className="bg-emerald-600 hover:bg-emerald-700">
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
      {/* Anti-cheat tracker - invisible component */}
      {quizStarted && !quizComplete && quizData?.settings?.enableAntiCheat && (
        <AntiCheatTracker 
          studentId={studentId} 
          quizCode={resolvedParams.code} 
          isActive={quizStarted && !quizComplete} 
        />
      )}
      
      {showFullscreenWarning && quizData.settings?.enableFullscreen ? (
        <FullscreenWarning
          onRequestFullscreen={() => {
            document.documentElement
              .requestFullscreen()
              .then(() => setShowFullscreenWarning(false))
              .catch((err) => console.error("Error entering fullscreen:", err))
          }}
        />
      ) : (
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
                  {quizData.settings?.enableBloomsTaxonomy && currentQuestion.bloomsLevel && (
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
                  <Button onClick={handleNextQuestion} className="bg-emerald-600 hover:bg-emerald-700">
                    {currentQuestionIndex < quizData.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
