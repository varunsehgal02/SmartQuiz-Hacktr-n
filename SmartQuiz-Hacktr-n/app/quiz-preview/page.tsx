"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Printer } from "lucide-react"
import Link from "next/link"
import { QuizPreview } from "@/components/quiz-preview"
import { AnswerKeyPreview } from "@/components/answer-key-preview"
import { exportToPdf } from "@/lib/pdf-export"

export default function QuizPreviewPage() {
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      setQuizData(JSON.parse(storedQuiz))
    }
    setIsLoading(false)
  }, [])

  const handleExportPdf = () => {
    if (quizData) {
      exportToPdf(quizData)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading quiz preview...</p>
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
              <Link href="/#generate-quiz">Generate a Quiz</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{quizData.title}</h1>
          <p className="text-gray-500 mt-1">
            {quizData.questions.length} questions · {quizData.difficulty} difficulty
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="answer-key">Answer Key</TabsTrigger>
        </TabsList>
        <TabsContent value="quiz" className="mt-6">
          <QuizPreview quiz={quizData} />
        </TabsContent>
        <TabsContent value="answer-key" className="mt-6">
          <AnswerKeyPreview quiz={quizData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
