import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface AnswerKeyPreviewProps {
  quiz: {
    title: string
    questions: Array<{
      id: string
      type: string
      question: string
      options?: string[]
      answer: string | boolean
      explanation?: string
    }>
  }
}

export function AnswerKeyPreview({ quiz }: AnswerKeyPreviewProps) {
  return (
    <div className="space-y-8 print:space-y-4">
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-2xl print:text-xl">Answer Key: {quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 print:space-y-4">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="space-y-2 print:break-inside-avoid">
                <h3 className="font-medium">
                  {index + 1}. {question.question}
                </h3>

                <div className="flex items-start gap-2 mt-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {question.type === "mcq" &&
                        `Answer: ${
                          typeof question.answer === "number"
                            ? question.options?.[question.answer as number]
                            : question.answer
                        }`}
                      {question.type === "true-false" && `Answer: ${question.answer ? "True" : "False"}`}
                      {(question.type === "short-answer" ||
                        question.type === "fill-in-blank" ||
                        question.type === "matching") &&
                        `Answer: ${question.answer}`}
                    </p>
                    {question.explanation && <p className="text-gray-600 text-sm mt-1">{question.explanation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
