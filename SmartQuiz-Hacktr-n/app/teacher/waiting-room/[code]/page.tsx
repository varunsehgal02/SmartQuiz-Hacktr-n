"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Play, UserX, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/protected-route"
import React from "react"

interface Student {
  id: string
  name: string
  avatar: string
  status: "pending" | "accepted" | "rejected"
  joinedAt: number
}

interface PageParams {
  code: string;
}

export default function WaitingRoomPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  return (
    <ProtectedRoute role="teacher">
      <WaitingRoomContent quizCode={resolvedParams.code} />
    </ProtectedRoute>
  )
}

function WaitingRoomContent({ quizCode }: { quizCode: string }) {
  const router = useRouter()
  const [quizData, setQuizData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [copied, setCopied] = useState(false)
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null)

  // Setup broadcast channel for cross-browser communication
  useEffect(() => {
    // Only create the channel in browser environment
    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('smartquiz_channel');
        
        channel.onmessage = (event) => {
          const data = event.data;
          console.log("[Teacher Waiting Room] Received broadcast message:", data);
          
          // Check if this is a student joining message for our quiz code
          if (data.type === 'student_join' && data.quizCode === quizCode) {
            console.log("[Teacher Waiting Room] Student joined via broadcast:", data.studentName);
            
            // Add the student to our list
            setStudents(prevStudents => {
              // Check if we already have this student
              if (prevStudents.some(s => s.id === data.studentId)) {
                return prevStudents;
              }
              
              // Create a new student entry
              const newStudent: Student = {
                id: data.studentId,
                name: data.studentName,
                avatar: data.studentName.charAt(0).toUpperCase(),
                status: "pending",
                joinedAt: Date.now()
              };
              
              toast({
                title: "New student joined",
                description: `${data.studentName} is waiting for approval.`
              });
              
              return [...prevStudents, newStudent];
            });
          }
        };
        
        setBroadcastChannel(channel);
        
        return () => {
          channel.close();
        };
      } catch (error) {
        console.error("[Teacher Waiting Room] BroadcastChannel not supported:", error);
      }
    }
  }, [quizCode]);
  
  const checkForNewStudents = useCallback(() => {
    // In a real app, this would query a database or API
    // Since we're using localStorage for demo, we'll check for students who joined with this code
    try {
      console.log("[Teacher Waiting Room] Checking for new students with quiz code:", quizCode);
      
      // Create an array to store joined students from localStorage
      let joinedStudents: Student[] = []
      
      // Check localStorage for any stored student records
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('student_join_')) {
          try {
            const studentData = JSON.parse(localStorage.getItem(key) || '{}')
            console.log("[Teacher Waiting Room] Found student data:", key, studentData);
            
            // Check if this student joined for this specific quiz code
            if (studentData.quizCode === quizCode) {
              console.log("[Teacher Waiting Room] Student matches quiz code, adding to list:", studentData.name);
              // Add to our joined students array
              joinedStudents.push({
                id: studentData.id,
                name: studentData.name,
                avatar: studentData.name.charAt(0).toUpperCase(),
                status: studentData.status || "pending",
                joinedAt: studentData.joinedAt
              })
            }
          } catch (error) {
            console.error("[Teacher Waiting Room] Error parsing student data:", error)
          }
        }
      }
      
      console.log("[Teacher Waiting Room] Total joined students found:", joinedStudents.length);
      
      // Update our state with all students found
      if (joinedStudents.length > 0) {
        setStudents(prevStudents => {
          const existingIds = new Set(prevStudents.map(s => s.id))
          const newStudents = joinedStudents.filter(s => !existingIds.has(s.id))
          
          console.log("[Teacher Waiting Room] New students:", newStudents.length);
          
          if (newStudents.length > 0) {
            // Show notification for new students
            toast({
              title: `${newStudents.length} new student${newStudents.length > 1 ? 's' : ''} joined`,
              description: "Review and accept them to add to your quiz."
            })
            
            // Combine existing students (keeping their current status) with new ones
            const updatedStudents = [
              ...prevStudents,
              ...newStudents
            ]
            
            // Ensure no duplicates by using the most recent data for each student
            const uniqueStudents = Array.from(
              updatedStudents.reduce((map, student) => {
                map.set(student.id, student)
                return map
              }, new Map()).values()
            )
            
            console.log("[Teacher Waiting Room] Updated students list:", uniqueStudents);
            return uniqueStudents
          }
          
          return prevStudents
        })
      }
    } catch (error) {
      console.error("[Teacher Waiting Room] Error checking for new students:", error)
    }
  }, [quizCode])
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const storedQuiz = localStorage.getItem("generatedQuiz")
    if (storedQuiz) {
      try {
        const parsedQuizData = JSON.parse(storedQuiz);
        console.log("[Teacher Waiting Room] Loaded quiz data:", parsedQuizData);
        
        // Store the quiz code in the quiz data if it's not already there
        if (!parsedQuizData.quizCode || parsedQuizData.quizCode !== quizCode) {
          parsedQuizData.quizCode = quizCode;
          // Update the stored quiz with the code
          localStorage.setItem("generatedQuiz", JSON.stringify(parsedQuizData));
          console.log("[Teacher Waiting Room] Updated quiz data with code:", quizCode);
        }
        
        setQuizData(parsedQuizData);
        
        // Update document title with quiz info
        const quizTitle = parsedQuizData.title || "Quiz";
        document.title = `Waiting Room | ${quizTitle} (${quizCode})`;
      } catch (error) {
        console.error("[Teacher Waiting Room] Error parsing quiz data:", error);
      }
    } else {
      console.warn("[Teacher Waiting Room] No quiz data found in localStorage");
    }
    
    // Initial check for students who may have already joined
    checkForNewStudents()
    
    // Set up polling to check for new students every 3 seconds
    const pollingInterval = setInterval(checkForNewStudents, 3000)
    
    setIsLoading(false)
    
    return () => {
      clearInterval(pollingInterval)
      
      // Reset document title when leaving the page
      document.title = "SmartQuiz Architect";
    }
  }, [checkForNewStudents, quizCode])

  const handleCopyLink = () => {
    const joinLink = `${window.location.origin}/student/join/${quizCode}`
    navigator.clipboard.writeText(joinLink)
    setCopied(true)
    toast({
      title: "Link copied!",
      description: "Share this link with your students to join the quiz.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAcceptStudent = (id: string) => {
    setStudents(students.map((student) => (student.id === id ? { ...student, status: "accepted" } : student)))
    toast({
      title: "Student accepted",
      description: `Student has been added to the quiz.`,
    })
    
    // In a real app, we would send this update to the backend
    // For our demo, we'll update a record in localStorage to track acceptance
    try {
      const studentKey = `student_join_${id}`
      const studentData = JSON.parse(localStorage.getItem(studentKey) || '{}')
      studentData.status = "accepted"
      localStorage.setItem(studentKey, JSON.stringify(studentData))
    } catch (error) {
      console.error("Error updating student status:", error)
    }
  }

  const handleRejectStudent = (id: string) => {
    setStudents(students.map((student) => (student.id === id ? { ...student, status: "rejected" } : student)))
    toast({
      title: "Student rejected",
      description: `Student has been removed from the waiting list.`,
    })
    
    // In a real app, we would send this update to the backend
    // For our demo, we'll update the record in localStorage
    try {
      const studentKey = `student_join_${id}`
      const studentData = JSON.parse(localStorage.getItem(studentKey) || '{}')
      studentData.status = "rejected"
      localStorage.setItem(studentKey, JSON.stringify(studentData))
    } catch (error) {
      console.error("Error updating student status:", error)
    }
  }

  const handleStartQuiz = () => {
    // In a real app, this would notify all students that the quiz has started
    
    // Mark the quiz as started in localStorage so students can proceed
    localStorage.setItem(`quiz_started_${quizCode}`, 'true')
    
    // Redirect to the quiz monitoring page
    router.push(`/teacher/quiz/${quizCode}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-lg">Setting up your quiz...</p>
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

  const joinLink = `${window.location.origin}/student/join/${quizCode}`
  const acceptedStudents = students.filter((s) => s.status === "accepted")
  const pendingStudents = students.filter((s) => s.status === "pending")

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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {quizData?.title ? `Waiting Room: ${quizData.title}` : "Waiting Room"}
            </CardTitle>
            <CardDescription>
              Share the join code with your students and wait for them to join.
              {quizData?.questions?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-gray-50/50">
                    {quizData.questions.length} {quizData.questions.length === 1 ? 'question' : 'questions'}
                  </Badge>
                  
                  <Badge variant="outline" className={`${
                    quizData.difficulty?.toLowerCase() === "easy" 
                      ? "bg-green-50/50 text-green-700 border-green-200" 
                      : quizData.difficulty?.toLowerCase() === "hard" 
                        ? "bg-red-50/50 text-red-700 border-red-200" 
                        : "bg-yellow-50/50 text-yellow-700 border-yellow-200"
                    }`}>
                    {quizData.difficulty?.charAt(0).toUpperCase() + quizData.difficulty?.slice(1) || 'Medium'} difficulty
                  </Badge>
                  
                  {quizData.settings?.questionFormat && (
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200">
                      {quizData.settings.questionFormat === "mcq" 
                        ? "Multiple Choice" 
                        : quizData.settings.questionFormat === "fill-in-blank"
                          ? "Fill in the Blanks"
                          : quizData.settings.questionFormat === "short-answer"
                            ? "Short Answer"
                            : "Mixed Questions"}
                    </Badge>
                  )}
                  
                  {quizData.settings?.timeLimit && (
                    <Badge variant="outline" className="bg-orange-50/50 text-orange-700 border-orange-200">
                      {quizData.settings.timeLimit} min time limit
                    </Badge>
                  )}
                  
                  {quizData.category && (
                    <Badge variant="outline" className="bg-purple-50/50 text-purple-700 border-purple-200">
                      {quizData.category}
                    </Badge>
                  )}
                  
                  {quizData.targetGrade && (
                    <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-200">
                      Grade {quizData.targetGrade}
                    </Badge>
                  )}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connected Students Summary */}
            <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium">Student Status</p>
                  <p className="text-sm text-gray-500">Real-time updates</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{acceptedStudents.length}</p>
                  <p className="text-xs text-gray-500">Accepted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{pendingStudents.length}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{students.filter(s => s.status === "rejected").length}</p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="bg-gray-100 p-4 rounded-md flex-1">
                <p className="text-sm text-gray-500 mb-1">Quiz Code:</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-wider">{quizCode}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" onClick={handleCopyLink}>
                          {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy join link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Students can join at: <span className="font-medium">{joinLink}</span>
                </p>
              </div>

              <div className="flex-shrink-0">
                <Button
                  onClick={handleStartQuiz}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={acceptedStudents.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {acceptedStudents.length === 0 
                    ? "Waiting for students..." 
                    : `Start Quiz with ${acceptedStudents.length} ${acceptedStudents.length === 1 ? 'student' : 'students'}`}
                </Button>
              </div>
            </div>

            <Alert>
              <Users className="h-4 w-4" />
              <AlertTitle>Quiz Details</AlertTitle>
              <AlertDescription className="space-y-2">
                <div className="flex flex-col">
                  <div className="flex items-start">
                    <span className="font-semibold min-w-24">Title:</span>
                    <span className="text-wrap">{quizData?.title || "Untitled Quiz"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-semibold min-w-24">Questions:</span>
                    <span>{quizData?.questions?.length || 0} questions</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-semibold min-w-24">Difficulty:</span>
                    <span>
                      {quizData?.difficulty ? quizData.difficulty.charAt(0).toUpperCase() + quizData.difficulty.slice(1) : "Medium"}
                      <span className={`ml-2 inline-block w-3 h-3 rounded-full ${
                        quizData?.difficulty?.toLowerCase() === "easy" 
                          ? "bg-green-500" 
                          : quizData?.difficulty?.toLowerCase() === "hard" 
                            ? "bg-red-500" 
                            : "bg-yellow-500"
                      }`} />
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-semibold min-w-24">Question Type:</span>
                    <span>
                      {quizData?.settings?.questionFormat ? (
                        quizData.settings.questionFormat === "mcq" 
                          ? "Multiple Choice" 
                          : quizData.settings.questionFormat === "fill-in-blank"
                            ? "Fill in the Blanks"
                            : quizData.settings.questionFormat === "short-answer"
                              ? "Short Answer"
                              : "Mixed Question Types"
                      ) : "Multiple Choice"}
                    </span>
                  </div>
                  
                  {quizData?.description && (
                    <div className="flex items-start mt-1">
                      <span className="font-semibold min-w-24">Topic:</span>
                      <span className="text-wrap text-sm text-gray-600">{quizData.description}</span>
                    </div>
                  )}
                  
                  {quizData?.settings && (
                    <div className="flex items-center mt-1">
                      <span className="font-semibold min-w-24">Features:</span>
                      <div className="flex flex-wrap gap-1">
                        {quizData.settings.enableBloomsTaxonomy && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Bloom's Taxonomy
                          </span>
                        )}
                        {quizData.settings.randomizeQuestions && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Randomized Questions
                          </span>
                        )}
                        {quizData.settings.enableAntiCheat && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            Anti-Cheat
                          </span>
                        )}
                        {quizData.settings.timeLimit && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {quizData.settings.timeLimit} min Time Limit
                          </span>
                        )}
                        {quizData.settings.allowPartialCredit && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Partial Credit
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {quizData?.category && (
                    <div className="flex items-center mt-1">
                      <span className="font-semibold min-w-24">Category:</span>
                      <span>{quizData.category}</span>
                    </div>
                  )}
                  
                  {quizData?.targetGrade && (
                    <div className="flex items-center mt-1">
                      <span className="font-semibold min-w-24">Grade Level:</span>
                      <span>{quizData.targetGrade}</span>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Accepted Students</CardTitle>
                <Badge variant="outline">{acceptedStudents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {acceptedStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No students have joined yet.</p>
              ) : (
                <ul className="space-y-3">
                  {acceptedStudents.map((student) => (
                    <li key={student.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-emerald-100 text-emerald-800">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleRejectStudent(student.id)}>
                        <UserX className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Waiting for Approval</CardTitle>
                <Badge variant="outline">{pendingStudents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {pendingStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No pending students.</p>
              ) : (
                <ul className="space-y-3">
                  {pendingStudents.map((student) => (
                    <li key={student.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gray-200">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500 hover:bg-green-50"
                          onClick={() => handleAcceptStudent(student.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleRejectStudent(student.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
