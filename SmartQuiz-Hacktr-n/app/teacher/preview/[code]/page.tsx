"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Printer, Play } from "lucide-react"
import Link from "next/link"
import { QuizPreview } from "@/components/quiz-preview"
import { AnswerKeyPreview } from "@/components/answer-key-preview"
import { exportToPdf } from "@/lib/pdf-export"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "@/components/ui/use-toast"
import React from "react"

interface PageParams {
  code: string;
}

export default function TeacherPreviewPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  return (
    <ProtectedRoute role="teacher">
      <TeacherPreviewContent quizCode={resolvedParams.code} />
    </ProtectedRoute>
  )
}

function TeacherPreviewContent({ quizCode: initialQuizCode }: { quizCode: string }) {
  const router = useRouter()
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("quiz")
  const [quizCode, setQuizCode] = useState<string>(initialQuizCode)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      try {
        const parsedQuizData = JSON.parse(storedQuiz);
        console.log("[Teacher Preview] Loaded quiz data:", parsedQuizData);
        
        // If the stored quiz has a different code, update our local state
        if (parsedQuizData.quizCode && parsedQuizData.quizCode !== quizCode) {
          setQuizCode(parsedQuizData.quizCode);
        }
        
        setQuizData(parsedQuizData)
      } catch (error) {
        console.error("[Teacher Preview] Error parsing quiz data:", error);
      }
    }
    setIsLoading(false)
  }, [quizCode])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPdf = () => {
    if (quizData) {
      exportToPdf(quizData)
      toast({
        title: "PDF exported",
        description: "The quiz has been exported as a PDF file.",
      })
    }
  }

  const handleProceedToWaitingRoom = () => {
    // Make sure the quiz code is stored with the quiz data
    if (quizData && (!quizData.quizCode || quizData.quizCode !== quizCode)) {
      // Update the quizCode in the quizData
      const updatedQuizData = {
        ...quizData,
        quizCode
      };

      // Store the updated quiz data
      localStorage.setItem("generatedQuiz", JSON.stringify(updatedQuizData));
      console.log("[Teacher Preview] Updated quiz data with code before proceeding:", quizCode);
    }
    
    // Redirect to waiting room
    router.push(`/teacher/waiting-room/${quizCode}`);
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
    <div className="container py-8 max-w-5xl print:py-2">
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportPdf}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleProceedToWaitingRoom} className="bg-emerald-600 hover:bg-emerald-700">
              <Play className="mr-2 h-4 w-4" />
              Proceed to Waiting Room
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Quiz Preview</CardTitle>
            <CardDescription>
              {quizData.description}
              <p className="mt-2">
                <strong>Quiz Code:</strong> {quizCode} | <strong>Difficulty:</strong> {quizData.difficulty} |{" "}
                <strong>Questions:</strong> {quizData.questions.length}
              </p>
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="quiz" value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz">Student View</TabsTrigger>
            <TabsTrigger value="answers">Answer Key</TabsTrigger>
          </TabsList>
          <TabsContent value="quiz">
            <QuizPreview quiz={quizData} />
          </TabsContent>
          <TabsContent value="answers">
            <AnswerKeyPreview quiz={quizData} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold mb-2">{quizData.title}</h1>
        <p className="mb-4">{quizData.description}</p>
        {activeTab === "quiz" ? <QuizPreview quiz={quizData} /> : <AnswerKeyPreview quiz={quizData} />}
      </div>
    </div>
  )
} 