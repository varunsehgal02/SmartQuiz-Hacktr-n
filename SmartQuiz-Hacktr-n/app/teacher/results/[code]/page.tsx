"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Home, Trophy, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react"

interface StudentResult {
  id: string
  name: string
  score: number
  totalQuestions: number
  timeSpent: number
  answers: Record<string, any>
}

interface PageParams {
  code: string;
}

export default function TeacherResultsPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  const router = useRouter()
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [studentResults, setStudentResults] = useState<StudentResult[]>([])

  useEffect(() => {
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      const quiz = JSON.parse(storedQuiz)
      setQuizData(quiz)
      
      const mockStudents = [
        { id: "s1", name: "Alex Johnson", score: 85, timeSpent: 480 },
        { id: "s2", name: "Maria Garcia", score: 92, timeSpent: 520 },
        { id: "s3", name: "Jamal Brown", score: 78, timeSpent: 450 },
        { id: "s4", name: "Sarah Kim", score: 88, timeSpent: 510 },
      ];
      
      const results = mockStudents.map(student => ({
        ...student,
        totalQuestions: quiz.questions.length,
        answers: {}
      }));
      
      setStudentResults(results);
    }
    
    setIsLoading(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getAverageScore = () => {
    if (studentResults.length === 0) return 0
    const total = studentResults.reduce((sum, student) => sum + student.score, 0)
    return Math.round(total / studentResults.length)
  }

  const getTopStudent = () => {
    if (studentResults.length === 0) return null
    return studentResults.reduce((top, student) => (student.score > top.score ? student : top), studentResults[0])
  }

  const handleExportResults = () => {
    // In a real app, this would generate and download a CSV or PDF
    alert("This would download the results in a real application.")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading results...</p>
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

  const topStudent = getTopStudent()

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Button variant="outline" onClick={handleExportResults}>
          <Download className="mr-2 h-4 w-4" />
          Export Results
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Quiz Results</CardTitle>
                <CardDescription>
                  {quizData.title} · {studentResults.length} students participated
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                Quiz Code: {resolvedParams.code}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-emerald-100 p-3 rounded-full mb-2">
                      <Trophy className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-medium">Average Score</h3>
                    <p className="text-3xl font-bold text-emerald-600">{getAverageScore()}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-emerald-100 p-3 rounded-full mb-2">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-medium">Top Student</h3>
                    {topStudent && (
                      <div className="flex flex-col items-center">
                        <p className="font-bold">{topStudent.name}</p>
                        <p className="text-emerald-600 font-medium">{topStudent.score}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-emerald-100 p-3 rounded-full mb-2">
                      <svg
                        className="h-6 w-6 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium">Average Time</h3>
                    <p className="text-xl font-bold">
                      {formatTime(
                        studentResults.reduce((sum, s) => sum + s.timeSpent, 0) / (studentResults.length || 1),
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="students">
              <TabsList className="mb-4">
                <TabsTrigger value="students">Student Results</TabsTrigger>
                <TabsTrigger value="questions">Question Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="students">
                <div className="space-y-4">
                  {studentResults.map((student) => (
                    <div key={student.id} className="flex items-center gap-4 p-3 rounded-md border">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-800">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-sm">
                            {Math.round((student.score / 100) * student.totalQuestions)}/{student.totalQuestions}{" "}
                            correct
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Progress value={student.score} className="h-2 flex-1 mr-4" />
                          <span
                            className={`font-bold ${
                              student.score >= 80
                                ? "text-green-600"
                                : student.score >= 60
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {student.score}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Time spent: {formatTime(student.timeSpent)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="questions">
                <div className="space-y-4">
                  {quizData.questions.slice(0, 5).map((question: any, index: number) => {
                    // In a real app, we would calculate these stats from actual student answers
                    const correctPercentage = Math.floor(Math.random() * 101)

                    return (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="pt-4">
                          <p className="font-medium mb-2">
                            {index + 1}. {question.question}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Correct answers:</span>
                            <span
                              className={`text-sm font-bold ${
                                correctPercentage >= 80
                                  ? "text-green-600"
                                  : correctPercentage >= 60
                                    ? "text-amber-600"
                                    : "text-red-600"
                              }`}
                            >
                              {correctPercentage}%
                            </span>
                          </div>
                          <Progress value={correctPercentage} className="h-2 mt-1" />
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Correct answer: </span>
                            <span>
                              {question.type === "mcq" && question.options
                                ? question.options[question.answer]
                                : question.answer}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
