"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Download, Plus, Check, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import { ProtectedRoute } from "@/components/protected-route"
import { BloomsTaxonomyBadge } from "@/components/blooms-taxonomy-badge"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { AntiCheatLogViewer } from "@/components/anti-cheat-log-viewer"

type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  answer: string | number;
  explanation?: string;
  bloomsLevel?: BloomLevel;
}

interface PageParams {
  code: string;
}

export default function TeacherQuizPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  return (
    <ProtectedRoute role="teacher">
      <TeacherQuizContent params={resolvedParams} />
    </ProtectedRoute>
  )
}

function TeacherQuizContent({ params }: { params: PageParams }) {
  const router = useRouter()
  const { toast } = useToast()
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState("view")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile device
    setIsMobile(window.innerWidth < 768)
    
    // In a real app, this would fetch from an API
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      setQuizData(JSON.parse(storedQuiz))
    }
    setIsLoading(false)

    // Start timer
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndQuiz = () => {
    toast({
      title: "Quiz Ended",
      description: "The quiz has been ended for all students.",
    })
    router.push(`/teacher/results/${params.code}`)
  }

  const renderOptionWithAnswer = (option: string, correctAnswer: string, index: number) => {
    const isCorrect = option === correctAnswer
    
    return (
      <div 
        key={index} 
        className={`p-3 border rounded-md flex justify-between items-center ${
          isCorrect ? "border-green-500 bg-green-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{String.fromCharCode(65 + index)}.</span>
          <span>{option}</span>
        </div>
        {isCorrect && <Check className="h-5 w-5 text-green-500" />}
      </div>
    )
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
            <CardTitle>No Quiz Found</CardTitle>
            <CardDescription>It seems you haven't generated a quiz yet.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/teacher/create-quiz">Generate a Quiz</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Quiz: {params.code}</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </Badge>
            <Button 
              onClick={handleEndQuiz}
              variant="destructive"
            >
              End Quiz
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{quizData.title}</h1>
              <p className="text-gray-500">{quizData.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{quizData.difficulty} Difficulty</Badge>
              <Badge variant="outline">{quizData.questions.length} Questions</Badge>
            </div>
          </div>

          <Tabs defaultValue="view" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="view">View Questions</TabsTrigger>
              <TabsTrigger value="students">Students Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="space-y-6">
              {quizData.questions.map((question: QuizQuestion, index: number) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2">Question {index + 1}</Badge>
                        <CardTitle>{question.question}</CardTitle>
                      </div>
                      {question.bloomsLevel && (
                        <BloomsTaxonomyBadge level={question.bloomsLevel} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {question.type === "mcq" && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => 
                          renderOptionWithAnswer(option, question.answer as string, optionIndex)
                        )}
                      </div>
                    )}
                    
                    {(question.type === "short-answer" || !question.options) && (
                      <div className="p-3 border rounded-md border-green-500 bg-green-50">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">Correct Answer</Badge>
                          <div>{question.answer}</div>
                        </div>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-700">{question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress</CardTitle>
                  <CardDescription>
                    Monitor your students' quiz progress in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {quizData.settings?.enableAntiCheat ? (
                    <AntiCheatLogViewer quizCode={params.code} />
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center p-8">
                        <p className="text-gray-500">No students have started the quiz yet.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
