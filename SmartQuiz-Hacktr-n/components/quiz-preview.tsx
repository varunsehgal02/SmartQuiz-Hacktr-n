import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface QuizPreviewProps {
  quiz: {
    title: string
    description: string
    questions: Array<{
      id: string
      type: string
      question: string
      options?: string[]
      answer?: string | boolean
    }>
  }
}

export function QuizPreview({ quiz }: QuizPreviewProps) {
  return (
    <div className="space-y-8 print:space-y-4">
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:pb-2">
          <CardTitle className="text-2xl print:text-xl">{quiz.title}</CardTitle>
          <p className="text-gray-500">{quiz.description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 print:space-y-4">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="space-y-2 print:break-inside-avoid">
                <h3 className="font-medium">
                  {index + 1}. {question.question}
                </h3>

                {question.type === "mcq" && question.options && (
                  <RadioGroup className="space-y-1">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={`option-${optIndex}`} id={`q${index}-option-${optIndex}`} disabled />
                        <Label htmlFor={`q${index}-option-${optIndex}`} className="text-sm font-normal">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "true-false" && (
                  <RadioGroup className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`q${index}-true`} disabled />
                      <Label htmlFor={`q${index}-true`} className="text-sm font-normal">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`q${index}-false`} disabled />
                      <Label htmlFor={`q${index}-false`} className="text-sm font-normal">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {question.type === "short-answer" && (
                  <Textarea placeholder="Write your answer here..." className="h-24 print:h-16" disabled />
                )}

                {question.type === "fill-in-blank" && (
                  <div className="border rounded-md p-3 bg-gray-50 print:bg-white">
                    <p className="italic text-gray-500">Fill in the blank with the correct answer.</p>
                  </div>
                )}

                {question.type === "matching" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Column A</p>
                      {question.options?.slice(0, question.options.length / 2).map((item, i) => (
                        <div key={i} className="border rounded-md p-2">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Column B</p>
                      {question.options?.slice(question.options.length / 2).map((item, i) => (
                        <div key={i} className="border rounded-md p-2">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
