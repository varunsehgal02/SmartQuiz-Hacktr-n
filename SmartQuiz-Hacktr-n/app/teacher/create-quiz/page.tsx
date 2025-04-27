"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/firebase-config"
import { doc, getDoc } from "firebase/firestore"
import { ProtectedRoute } from "@/components/protected-route"
import { AIQuizForm } from "@/components/ai-quiz-form"

export default function CreateQuizPage() {
  return (
    <ProtectedRoute role="teacher">
      <CreateQuizPageContent />
    </ProtectedRoute>
  )
}

function CreateQuizPageContent() {
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
                router.push("/teacher/dashboard")
              }}
              variant="outline"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/teacher/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create AI-Powered Quiz</h1>
              <p className="text-gray-500">Generate custom quiz questions with our AI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-emerald-800">
                <strong>Tip:</strong> For best results, be specific about the topic and the type of questions you want. 
                Example: "Make a quiz on Set DataStructure focusing on critical thinking."
              </p>
            </div>
            
            <AIQuizForm />
          </div>
        </div>
      </main>
    </div>
  )
} 