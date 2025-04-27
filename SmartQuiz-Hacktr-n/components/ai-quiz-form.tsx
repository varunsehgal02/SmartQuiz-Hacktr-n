"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Control, Resolver, SubmitHandler, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  NLPprompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  num_questions: z.number().min(1).max(30),
  Difficulty: z.string(),
  question_types: z.array(z.string()).min(1, {
    message: "Select at least one question type",
  }),
  progressive_bloom: z.boolean().default(true),
  enableAntiCheat: z.boolean().default(false),
})

type QuestionOption = {
  id: string;
  label: string;
  value: string;
}

const QUESTION_TYPES: QuestionOption[] = [
  { id: "mcq", label: "Multiple Choice", value: "MCQ" },
  { id: "true-false", label: "True/False", value: "TrueFalse" },
  { id: "short-answer", label: "Short Answer", value: "ShortAnswer" }
]

export function AIQuizForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      NLPprompt: "",
      num_questions: 5,
      Difficulty: "Medium",
      question_types: ["MCQ"],
      progressive_bloom: true,
      enableAntiCheat: false,
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
    setIsLoading(true)
    try {
      // Format the values to match the API requirements
      const requestBody = {
        NLPprompt: values.NLPprompt,
        num_questions: values.num_questions,
        Difficulty: values.Difficulty,
        question_types: values.question_types,
        progressive_bloom: values.progressive_bloom,
        enableAntiCheat: values.enableAntiCheat
      }

      // Call the API endpoint
      const response = await fetch(
        "https://af80-2401-4900-36a0-5191-d127-6b1-c9bf-f03f.ngrok-free.app/generate-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const quizData = await response.json()
      
      // Generate a unique quiz code
      const quizCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Transform the API response to match our app's quiz format
      const formattedQuestions = quizData.map((question: any, index: number) => {
        return {
          id: `q-${index + 1}`,
          type: question.type.toLowerCase(),
          question: question.question,
          options: question.options || [],
          answer: question.correct_answer,
          explanation: question.explanation || "",
          bloomsLevel: question.bloom_level?.toLowerCase() || undefined
        }
      })

      // Store the generated quiz in localStorage
      localStorage.setItem(
        "generatedQuiz",
        JSON.stringify({
          title: `Quiz on ${values.NLPprompt.split(" ").slice(0, 5).join(" ")}...`,
          description: values.NLPprompt,
          difficulty: values.Difficulty,
          questions: formattedQuestions,
          settings: values,
          quizCode,
        }),
      )

      toast({
        title: "Quiz Generated Successfully",
        description: `Created ${quizData.length} questions on your topic.`,
      })

      // Redirect to preview page instead of waiting room
      router.push(`/teacher/preview/${quizCode}`)
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Error Generating Quiz",
        description: "There was a problem generating your quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="NLPprompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Topic</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., Make a quiz on Set DataStructure focusing on critical thinking"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the topic and focus of the quiz you want to generate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="num_questions"
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
                    <FormDescription>Choose between 1 and 20 questions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the difficulty level for your quiz questions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="question_types"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Question Types</FormLabel>
                    <FormDescription>
                      Select the types of questions to include in your quiz
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {QUESTION_TYPES.map((type) => (
                      <FormField
                        key={type.id}
                        control={form.control}
                        name="question_types"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={type.id}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || []
                                    return checked
                                      ? field.onChange([...currentValues, type.value])
                                      : field.onChange(
                                          currentValues.filter((value) => value !== type.value)
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progressive_bloom"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Progressive Bloom's Taxonomy</FormLabel>
                    <FormDescription>
                      Structure questions to progress through different cognitive levels
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableAntiCheat"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-yellow-50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Anti-Cheat Monitoring</FormLabel>
                    <FormDescription>
                      Track student activity to detect potential cheating behaviors during the quiz
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </div>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 