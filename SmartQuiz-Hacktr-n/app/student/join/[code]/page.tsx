"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import React from "react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

interface PageParams {
  code: string;
}

export default function JoinQuizPage({ params }: { params: PageParams }) {
  const resolvedParams = React.use(params as unknown as Promise<PageParams>);
  return <JoinQuizContent quizCode={resolvedParams.code} />;
}

function JoinQuizContent({ quizCode }: { quizCode: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [quizExists, setQuizExists] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // In a real app, this would verify the quiz code with the backend
    // For demo purposes, check if a quiz with this code exists in localStorage
    let exists = false;
    
    // Check if the code is valid format (6 characters)
    if (quizCode && quizCode.length === 6) {
      // Check if a quiz with this code exists in generated quizzes
      const storedQuiz = localStorage.getItem("generatedQuiz");
      
      if (storedQuiz) {
        try {
          const quizData = JSON.parse(storedQuiz);
          // Check if the stored quiz code matches the provided code
          if (quizData.quizCode === quizCode || quizData.code === quizCode) {
            console.log("Found matching quiz in localStorage");
            exists = true;
          } else {
            // For demo purposes, allow joining with any 6-character code
            // even if it doesn't match exactly
            console.log("Quiz code doesn't match, but allowing for demo");
            exists = true;
          }
        } catch (error) {
          console.error("Error parsing stored quiz:", error);
        }
      } else {
        // For demo purposes, still allow joining if the code format is valid
        console.log("No stored quiz found, but allowing join for any valid code format");
        exists = true;
      }
    }
    
    setQuizExists(exists);

    // Animate the form in after a short delay
    const timer = setTimeout(() => {
      setShowForm(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [quizCode])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Generate a unique ID for this student
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Create a data object to store information about this student
    const studentData = {
      id: studentId,
      name: values.name,
      quizCode: quizCode,
      joinedAt: Date.now(),
      status: "pending"
    }
    
    // Add console logs for debugging
    console.log("[Student Join] Storing student data with key:", `student_join_${studentId}`);
    console.log("[Student Join] Student data:", studentData);
    
    try {
      // Store in localStorage with a prefix that can be detected by the teacher's waiting room
      localStorage.setItem(`student_join_${studentId}`, JSON.stringify(studentData))
      
      // Store just the name in localStorage for use in the waiting room and quiz
      localStorage.setItem("studentName", values.name)
      localStorage.setItem("currentStudentId", studentId) // Store the current student ID for easier reference
      
      // Also store information about the joined quiz for later reference
      localStorage.setItem("joinedQuiz", JSON.stringify({
        quizCode: quizCode,
        studentId: studentId,
        studentName: values.name,
        joinedAt: Date.now()
      }))

      // Broadcast student join to the teacher's waiting room
      try {
        // Create a broadcast channel
        const channel = new BroadcastChannel('smartquiz_channel');
        
        // Send a message with student join information
        channel.postMessage({
          type: 'student_join',
          studentId: studentId,
          studentName: values.name,
          quizCode: quizCode,
          joinedAt: Date.now()
        });
        
        console.log("[Student Join] Broadcast message sent for joining student");
        
        // Close the channel
        channel.close();
      } catch (error) {
        console.error("[Student Join] BroadcastChannel not supported:", error);
        // Fallback method: Use sessionStorage for cross-tab communication
        try {
          // Store in sessionStorage for other tabs to pick up
          const crossTabData = {
            type: 'student_join',
            studentId: studentId,
            studentName: values.name,
            quizCode: quizCode,
            joinedAt: Date.now(),
            timestamp: Date.now() // To help identify new entries
          };
          
          sessionStorage.setItem('smartquiz_join_event', JSON.stringify(crossTabData));
          console.log("[Student Join] Used sessionStorage fallback for cross-tab communication");
        } catch (err) {
          console.error("[Student Join] SessionStorage fallback also failed:", err);
        }
      }

      console.log("[Student Join] All data stored successfully. Redirecting to waiting room...");
      
      // In a real app, this would send a request to join the quiz
      // Redirect to the waiting room after a short delay
      setTimeout(() => {
        router.push(`/student/waiting/${quizCode}`)
      }, 1500)
    } catch (error) {
      console.error("[Student Join] Error storing student data:", error)
      alert("There was a problem joining the quiz. Please try again.")
      setIsLoading(false)
    }
  }

  if (!quizExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>The quiz code you entered does not exist or has expired.</CardDescription>
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
              <CardTitle>Join Quiz</CardTitle>
              <CardDescription>
                You're joining quiz with code: <span className="font-bold">{quizCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormDescription>This is how you'll appear to your teacher.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          "Join Quiz"
                        )}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
