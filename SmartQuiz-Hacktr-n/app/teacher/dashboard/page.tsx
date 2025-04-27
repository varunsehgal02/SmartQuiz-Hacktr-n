"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus, BarChart, Book } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import { ProtectedRoute } from "@/components/protected-route"

export default function TeacherDashboard() {
  return (
    <ProtectedRoute role="teacher">
      <TeacherDashboardContent />
    </ProtectedRoute>
  )
}

function TeacherDashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
            <p className="text-gray-500">Teacher Dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Create and manage your quizzes</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button 
                  onClick={() => router.push("/teacher/create-quiz")} 
                  className="bg-emerald-600 hover:bg-emerald-700 h-24 flex flex-col gap-2 items-center justify-center"
                >
                  <Plus className="h-6 w-6" />
                  <span>Create a New Quiz</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
                <CardDescription>Your activity overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <Book className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span>Quizzes Created</span>
                  </div>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-indigo-100 p-2">
                      <BarChart className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span>Students Engaged</span>
                  </div>
                  <span className="font-bold">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 