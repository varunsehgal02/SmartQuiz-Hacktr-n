"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, UserPlus, FileQuestion, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import { ProtectedRoute } from "@/components/protected-route"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StudentDashboard() {
  return (
    <ProtectedRoute role="student">
      <StudentDashboardContent />
    </ProtectedRoute>
  )
}

function StudentDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [quizCode, setQuizCode] = useState("")

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserName(userData.name || "")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  const handleJoinQuiz = () => {
    if (quizCode.trim()) {
      router.push(`/student/join/${quizCode.trim().toUpperCase()}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">SmartQuiz Architect</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/profile">Profile</Link>
            <Button 
              onClick={() => {
                router.push("/")
              }}
              variant="outline"
            >
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}</h1>
            <p className="text-gray-500">Student Dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Join a Quiz</CardTitle>
                <CardDescription>Enter a quiz code to participate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quiz-code">Quiz Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="quiz-code" 
                        placeholder="Enter quiz code" 
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value)}
                        className="uppercase"
                      />
                      <Button 
                        onClick={handleJoinQuiz} 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={!quizCode.trim()}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Quiz
                      </Button>
                    </div>
                  </div>
                
                  <Button 
                    onClick={() => router.push("/student/self-quiz")} 
                    variant="outline"
                    className="mt-4"
                  >
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Create Self-Practice Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Recent quiz participation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <FileQuestion className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span>Quizzes Taken</span>
                  </div>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-indigo-100 p-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span>Average Score</span>
                  </div>
                  <span className="font-bold">-</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 