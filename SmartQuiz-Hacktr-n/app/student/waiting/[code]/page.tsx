"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import React from "react"

interface PageParams {
  code: string;
}

export default function StudentWaitingPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  return <StudentWaitingContent quizCode={resolvedParams.code} />;
}

function StudentWaitingContent({ quizCode }: { quizCode: string }) {
  const router = useRouter()
  const [studentName, setStudentName] = useState("")
  const [studentId, setStudentId] = useState<string | null>(null)
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected" | "started">("pending")
  const [quizData, setQuizData] = useState<any>(null)

  useEffect(() => {
    // Get student name from localStorage
    const name = localStorage.getItem("studentName")
    console.log("[Student Waiting] Student name from localStorage:", name);
    
    if (name) {
      setStudentName(name)
    } else {
      // If no name is found, redirect back to join page
      console.log("[Student Waiting] No student name found, redirecting to join page");
      router.push(`/student/join/${quizCode}`)
      return
    }
    
    // Get quiz data if available
    const storedQuiz = localStorage.getItem("generatedQuiz")
    console.log("[Student Waiting] Quiz data available:", !!storedQuiz);
    
    if (storedQuiz) {
      try {
        const parsedQuizData = JSON.parse(storedQuiz)
        setQuizData(parsedQuizData)
        
        // Update document title
        document.title = `Waiting for ${parsedQuizData.title || "Quiz"} to start`;
      } catch (err) {
        console.error("[Student Waiting] Error parsing quiz data:", err)
      }
    }
    
    // Try to get the stored currentStudentId first (should be the fastest way)
    let foundStudentId = localStorage.getItem("currentStudentId")
    console.log("[Student Waiting] Current student ID from localStorage:", foundStudentId);
    
    if (foundStudentId) {
      console.log("[Student Waiting] Found current student ID:", foundStudentId)
      setStudentId(foundStudentId)
      
      // Check the status
      const studentKey = `student_join_${foundStudentId}`
      const studentDataStr = localStorage.getItem(studentKey)
      console.log("[Student Waiting] Student data from localStorage:", studentKey, studentDataStr);
      
      if (studentDataStr) {
        try {
          const studentData = JSON.parse(studentDataStr)
          console.log("[Student Waiting] Student status from localStorage:", studentData.status)
          
          // If we already have a status, use it
          if (studentData.status === "accepted" || studentData.status === "rejected") {
            setStatus(studentData.status)
          }
        } catch (err) {
          console.error("[Student Waiting] Error parsing student data:", err)
        }
      } else {
        console.warn("[Student Waiting] Student data not found for ID:", foundStudentId)
      }
    } else {
      // Fallback: Search through localStorage 
      console.log("[Student Waiting] Searching for student record in localStorage...")
      
      // Find this student's record in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        console.log("[Student Waiting] Checking localStorage key:", key);
        
        if (key && key.startsWith('student_join_')) {
          const studentDataStr = localStorage.getItem(key) || '{}'
          try {
            const studentData = JSON.parse(studentDataStr)
            console.log("[Student Waiting] Checking student data:", studentData);
            
            if (studentData.quizCode === quizCode && studentData.name === name) {
              foundStudentId = studentData.id
              console.log("[Student Waiting] Found matching student ID:", foundStudentId);
              setStudentId(foundStudentId)
              
              // Store it for future reference
              localStorage.setItem("currentStudentId", foundStudentId)
              
              // If we already have a status, use it
              if (studentData.status === "accepted" || studentData.status === "rejected") {
                setStatus(studentData.status)
              }
              break
            }
          } catch (err) {
            console.error("[Student Waiting] Error parsing data for key:", key, err)
          }
        }
      }
    }
    
    if (!foundStudentId) {
      console.error("[Student Waiting] Student record not found, creating fallback...")
      // Create a fallback if somehow we don't have a record
      const fallbackId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const fallbackData = {
        id: fallbackId,
        name: name,
        quizCode: quizCode,
        joinedAt: Date.now(),
        status: "pending"
      }
      localStorage.setItem(`student_join_${fallbackId}`, JSON.stringify(fallbackData))
      localStorage.setItem("currentStudentId", fallbackId)
      setStudentId(fallbackId)
      
      console.log("[Student Waiting] Created fallback student record:", fallbackId, fallbackData);
    }
    
    // Set up polling to check status
    const statusInterval = setInterval(() => {
      // Get the latest studentId from state or localStorage
      const currentId = localStorage.getItem("currentStudentId") || studentId;
      console.log("[Student Waiting] Polling - checking status for student ID:", currentId);
      
      if (currentId) {
        const studentKey = `student_join_${currentId}`
        const studentDataStr = localStorage.getItem(studentKey)
        console.log("[Student Waiting] Polling - student data:", studentKey, studentDataStr);
        
        if (studentDataStr) {
          try {
            const studentData = JSON.parse(studentDataStr)
            console.log("[Student Waiting] Polling - current student status:", studentData.status)
            
            if (studentData.status === "accepted") {
              setStatus("accepted")
            } else if (studentData.status === "rejected") {
              setStatus("rejected")
            }
          } catch (err) {
            console.error("[Student Waiting] Polling - error parsing student data:", err)
          }
        }
      }
      
      // Check if the quiz has started
      const quizStarted = localStorage.getItem(`quiz_started_${quizCode}`)
      console.log("[Student Waiting] Polling - quiz started status:", quizStarted);
      
      if (quizStarted === 'true' && status === "accepted") {
        console.log("[Student Waiting] Quiz has started, redirecting to quiz page...")
        setStatus("started")
        router.push(`/student/quiz/${quizCode}`)
      }
    }, 1500)
    
    return () => {
      clearInterval(statusInterval)
    }
  }, [quizCode, router, studentId, status])

  // Render based on status
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
              <CardTitle>Waiting for Teacher</CardTitle>
              <CardDescription>
                Quiz Code: <span className="font-bold">{quizCode}</span>
                {quizData && (
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">
                      {quizData.title} • {quizData.questions?.length || 0} questions • {quizData.difficulty || "Medium"} difficulty
                    </span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              {status === "pending" && (
                <>
                  <div className="relative w-24 h-24 mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-emerald-200"
                      initial={{ scale: 0.8, opacity: 0.3 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-emerald-300"
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.1, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                    />
                    <div className="absolute inset-0 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 text-lg font-medium">
                        {studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-1">Hello, {studentName}!</h3>
                  <p className="text-gray-500 text-center">Waiting for the teacher to accept you into the quiz...</p>
                </>
              )}

              {status === "accepted" && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-medium mb-1">You've been accepted!</h3>
                  <p className="text-gray-500 text-center">The quiz will begin when the teacher starts it. Get ready!</p>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                  </div>
                </>
              )}
              
              {status === "rejected" && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <svg
                      className="w-12 h-12 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-medium mb-1">Access Denied</h3>
                  <p className="text-gray-500 text-center">The teacher has declined your request to join this quiz.</p>
                  <div className="mt-4">
                    <Link href="/" className="text-emerald-600 hover:underline">
                      Return to Home
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
