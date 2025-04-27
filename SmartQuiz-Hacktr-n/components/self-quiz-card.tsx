"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }),
  numQuestions: z.number().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "hard"]),
  bloomsLevel: z.enum(["remember", "understand", "apply", "analyze", "evaluate", "create"]),
  questionType: z.enum(["mcq", "fill-in-blank", "short-answer", "mixed"]),
})

export function SelfQuizCard() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      numQuestions: 5,
      difficulty: "medium",
      bloomsLevel: "understand",
      questionType: "mcq",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Generate a unique code for the self-quiz
    const selfQuizCode = `SELF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Store the quiz parameters in localStorage
    localStorage.setItem(
      "selfQuizParams",
      JSON.stringify({
        ...values,
        code: selfQuizCode,
        createdAt: new Date().toISOString(),
      }),
    )

    // Redirect to the self-quiz page
    setTimeout(() => {
      router.push(`/student/self-quiz/${selfQuizCode}`)
    }, 1000)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>Create Self-Practice Quiz</CardTitle>
            </div>
            <CardDescription>Generate a practice quiz just for yourself.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Create your own personalized quiz to practice and test your knowledge on any topic.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                <span>Choose your topic and difficulty</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                <span>Focus on specific Bloom's levels</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
                <span>Track your progress over time</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700">
              Create Self-Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Self-Practice Quiz</DialogTitle>
            <DialogDescription>
              Customize your practice quiz to focus on the topics and skills you want to improve.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Photosynthesis, World War II" {...field} />
                    </FormControl>
                    <FormDescription>Enter the topic you want to practice.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={20}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>Choose between 1 and 20 questions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloomsLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloom's Level Focus</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bloom's level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="remember">Remember</SelectItem>
                          <SelectItem value="understand">Understand</SelectItem>
                          <SelectItem value="apply">Apply</SelectItem>
                          <SelectItem value="analyze">Analyze</SelectItem>
                          <SelectItem value="evaluate">Evaluate</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="mixed">Mixed Types</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Quiz"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
