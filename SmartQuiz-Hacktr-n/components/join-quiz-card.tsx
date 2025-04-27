"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users } from "lucide-react"
import { motion } from "framer-motion"

const formSchema = z.object({
  quizCode: z.string().min(4, {
    message: "Quiz code must be at least 4 characters.",
  }),
})

export function JoinQuizCard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizCode: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Redirect to the join page with the quiz code
    setTimeout(() => {
      router.push(`/student/join/${values.quizCode.toUpperCase()}`)
    }, 500)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle>Join a Quiz</CardTitle>
          </div>
          <CardDescription>Enter a quiz code provided by your teacher.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="quizCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter code (e.g., ABC123)"
                        {...field}
                        className="text-center text-lg uppercase tracking-wider"
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Join Quiz"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
