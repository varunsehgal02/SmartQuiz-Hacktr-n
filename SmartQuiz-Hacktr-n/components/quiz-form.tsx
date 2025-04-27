// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { SubmitHandler, useForm } from "react-hook-form"
// import * as z from "zod"
// import { Button } from "@/components/ui/button"
// import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
// import { Loader2 } from "lucide-react"
// import { generateQuiz } from "@/lib/quiz-generator"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Checkbox } from "@/components/ui/checkbox"

// const formSchema = z.object({
//   prompt: z.string().min(10, {
//     message: "Prompt must be at least 10 characters.",
//   }),
//   numQuestions: z.number().min(1).max(30),
//   difficulty: z.enum(["easy", "medium", "hard"]),
//   questionFormat: z.enum(["mcq", "fill-in-blank", "short-answer", "random"]),
//   timerMode: z.enum(["automatic", "manual"]),
//   manualTimerSeconds: z.number().min(10).max(300).default(60),
//   enableFullscreen: z.boolean().default(true),
//   enableBloomsTaxonomy: z.boolean().default(true),
//   enableAntiCheat: z.boolean().default(true),
//   randomizeQuestions: z.boolean().default(true),
//   numChoices: z.number().min(3).max(5).default(4),
//   includeHints: z.boolean().default(false),
//   learningObjectives: z.array(z.string()).optional(),
// })

// export function QuizForm() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [activeTab, setActiveTab] = useState("basic")

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       prompt: "",
//       numQuestions: 10,
//       difficulty: "medium",
//       questionFormat: "mcq",
//       timerMode: "automatic",
//       manualTimerSeconds: 60,
//       enableFullscreen: true,
//       enableBloomsTaxonomy: true,
//       enableAntiCheat: true,
//       randomizeQuestions: true,
//       numChoices: 4,
//       includeHints: false,
//       learningObjectives: [],
//     },
//   })

//   const watchTimerMode = form.watch("timerMode")
//   const watchQuestionFormat = form.watch("questionFormat")

//   const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
//     setIsLoading(true)
//     try {
//       // In a real app, this would call an API endpoint
//       const quizData = await generateQuiz(values)

//       // Generate a unique quiz code
//       const quizCode = Math.random().toString(36).substring(2, 8).toUpperCase()

//       // Store the generated quiz in localStorage for demo purposes
//       localStorage.setItem(
//         "generatedQuiz",
//         JSON.stringify({
//           ...quizData,
//           settings: values,
//           quizCode,
//         }),
//       )

//       // Redirect to the teacher waiting room
//       router.push(`/teacher/waiting-room/${quizCode}`)
//     } catch (error) {
//       console.error("Error generating quiz:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<z.infer<typeof formSchema>>)} className="space-y-8">
//         <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="basic">Basic</TabsTrigger>
//             <TabsTrigger value="format">Format</TabsTrigger>
//             <TabsTrigger value="learning">Learning</TabsTrigger>
//             <TabsTrigger value="advanced">Advanced</TabsTrigger>
//           </TabsList>

//           <TabsContent value="basic" className="space-y-6 pt-4">
//             <FormField
//               control={form.control}
//               name="prompt"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Quiz Prompt</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="E.g., 10 easy questions on Newton's Laws focusing on application and analysis levels."
//                       className="min-h-[120px]"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormDescription>Describe the quiz you want to generate in natural language.</FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormField
//                 control={form.control}
//                 name="numQuestions"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Number of Questions: {field.value}</FormLabel>
//                     <FormControl>
//                       <Slider
//                         min={1}
//                         max={30}
//                         step={1}
//                         defaultValue={[field.value ?? 0]}
//                         onValueChange={(value) => field.onChange(value[0])}
//                       />
//                     </FormControl>
//                     <FormDescription>Choose between 1 and 30 questions.</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="difficulty"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Difficulty Level</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select difficulty" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="easy">Easy (Simple recall)</SelectItem>
//                         <SelectItem value="medium">Medium (Application/Understanding)</SelectItem>
//                         <SelectItem value="hard">Hard (Critical Thinking/Evaluation)</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormDescription>Select the difficulty level for your quiz.</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="flex justify-end">
//               <Button
//                 type="button"
//                 onClick={() => setActiveTab("format")}
//                 className="bg-emerald-600 hover:bg-emerald-700"
//               >
//                 Next: Question Format
//               </Button>
//             </div>
//           </TabsContent>

//           <TabsContent value="format" className="space-y-6 pt-4">
//             <FormField
//               control={form.control}
//               name="questionFormat"
//               render={({ field }) => (
//                 <FormItem className="space-y-3">
//                   <FormLabel>Question Format</FormLabel>
//                   <FormControl>
//                     <RadioGroup
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                     >
//                       <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
//                         <RadioGroupItem value="mcq" id="format-mcq" />
//                         <div className="space-y-1">
//                           <Label htmlFor="format-mcq" className="font-medium">
//                             Multiple Choice Questions
//                           </Label>
//                           <p className="text-sm text-gray-500">Questions with options where only one is correct.</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
//                         <RadioGroupItem value="fill-in-blank" id="format-fill" />
//                         <div className="space-y-1">
//                           <Label htmlFor="format-fill" className="font-medium">
//                             Fill in the Blanks
//                           </Label>
//                           <p className="text-sm text-gray-500">
//                             Questions where students need to fill in missing words.
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
//                         <RadioGroupItem value="short-answer" id="format-short" />
//                         <div className="space-y-1">
//                           <Label htmlFor="format-short" className="font-medium">
//                             Short Answer
//                           </Label>
//                           <p className="text-sm text-gray-500">Questions requiring brief written responses.</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
//                         <RadioGroupItem value="random" id="format-random" />
//                         <div className="space-y-1">
//                           <Label htmlFor="format-random" className="font-medium">
//                             Random Mix
//                           </Label>
//                           <p className="text-sm text-gray-500">A mix of different question types selected randomly.</p>
//                         </div>
//                       </div>
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {watchQuestionFormat === "mcq" && (
//               <FormField
//                 control={form.control}
//                 name="numChoices"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Number of Choices: {field.value}</FormLabel>
//                     <FormControl>
//                       <Slider
//                         min={3}
//                         max={5}
//                         step={1}
//                         defaultValue={[field.value ?? 0]}
//                         onValueChange={(value) => field.onChange(value[0])}
//                       />
//                     </FormControl>
//                     <FormDescription>Choose between 3 and 5 options per question.</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <FormField
//               control={form.control}
//               name="timerMode"
//               render={({ field }) => (
//                 <FormItem className="space-y-3">
//                   <FormLabel>Timer Mode</FormLabel>
//                   <FormControl>
//                     <RadioGroup
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                     >
//                       <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
//                         <RadioGroupItem value="automatic" id="timer-auto" />
//                         <div className="space-y-1">
//                           <Label htmlFor="timer-auto" className="font-medium">
//                             Automatic
//                           </Label>
//                           <p className="text-sm text-gray-500">
//                             Timer is set automatically based on question difficulty:
//                             <br />
//                             Easy: 30s | Medium: 45s | Hard: 60s
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
//                         <RadioGroupItem value="manual" id="timer-manual" />
//                         <div className="space-y-1">
//                           <Label htmlFor="timer-manual" className="font-medium">
//                             Manual
//                           </Label>
//                           <p className="text-sm text-gray-500">Set a custom time limit for each question.</p>
//                         </div>
//                       </div>
//                     </RadioGroup>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {watchTimerMode === "manual" && (
//               <FormField
//                 control={form.control}
//                 name="manualTimerSeconds"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Time per Question (seconds): {field.value}</FormLabel>
//                     <FormControl>
//                       <Slider
//                         min={10}
//                         max={300}
//                         step={5}
//                         defaultValue={[field.value || 60]}
//                         onValueChange={(value) => field.onChange(value[0])}
//                       />
//                     </FormControl>
//                     <FormDescription>Set the time limit for each question (10-300 seconds).</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <div className="flex justify-between">
//               <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
//                 Back
//               </Button>
//               <Button
//                 type="button"
//                 onClick={() => setActiveTab("learning")}
//                 className="bg-emerald-600 hover:bg-emerald-700"
//               >
//                 Next: Learning Objectives
//               </Button>
//             </div>
//           </TabsContent>

//           <TabsContent value="learning" className="space-y-6 pt-4">
//             <FormField
//               control={form.control}
//               name="learningObjectives"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Learning Objectives</FormLabel>
//                   <FormDescription className="mb-3">
//                     Select the learning objectives you want to focus on in this quiz.
//                   </FormDescription>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value?.includes("critical-thinking")}
//                           onCheckedChange={(checked) => {
//                             const updatedValue = checked
//                               ? [...(field.value || []), "critical-thinking"]
//                               : field.value?.filter((value) => value !== "critical-thinking")
//                             field.onChange(updatedValue)
//                           }}
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel className="font-medium">Critical Thinking</FormLabel>
//                         <FormDescription>
//                           Questions that require analysis, evaluation, and synthesis of information.
//                         </FormDescription>
//                       </div>
//                     </FormItem>
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value?.includes("problem-solving")}
//                           onCheckedChange={(checked) => {
//                             const updatedValue = checked
//                               ? [...(field.value || []), "problem-solving"]
//                               : field.value?.filter((value) => value !== "problem-solving")
//                             field.onChange(updatedValue)
//                           }}
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel className="font-medium">Problem Solving</FormLabel>
//                         <FormDescription>
//                           Questions that require applying knowledge to solve practical problems.
//                         </FormDescription>
//                       </div>
//                     </FormItem>
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value?.includes("basic-recall")}
//                           onCheckedChange={(checked) => {
//                             const updatedValue = checked
//                               ? [...(field.value || []), "basic-recall"]
//                               : field.value?.filter((value) => value !== "basic-recall")
//                             field.onChange(updatedValue)
//                           }}
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel className="font-medium">Basic Recall</FormLabel>
//                         <FormDescription>
//                           Questions that test memory and basic understanding of concepts.
//                         </FormDescription>
//                       </div>
//                     </FormItem>
//                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
//                       <FormControl>
//                         <Checkbox
//                           checked={field.value?.includes("application")}
//                           onCheckedChange={(checked) => {
//                             const updatedValue = checked
//                               ? [...(field.value || []), "application"]
//                               : field.value?.filter((value) => value !== "application")
//                             field.onChange(updatedValue)
//                           }}
//                         />
//                       </FormControl>
//                       <div className="space-y-1 leading-none">
//                         <FormLabel className="font-medium">Application</FormLabel>
//                         <FormDescription>Questions that require applying knowledge in new situations.</FormDescription>
//                       </div>
//                     </FormItem>
//                   </div>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="enableBloomsTaxonomy"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                   <div className="space-y-0.5">
//                     <FormLabel className="text-base">Bloom's Taxonomy Badges</FormLabel>
//                     <FormDescription>
//                       Show badges indicating the cognitive level of each question (Remember, Understand, Apply, etc.).
//                     </FormDescription>
//                   </div>
//                   <FormControl>
//                     <Switch checked={field.value} onCheckedChange={field.onChange} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="includeHints"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                   <div className="space-y-0.5">
//                     <FormLabel className="text-base">Include Hints</FormLabel>
//                     <FormDescription>
//                       Add optional small clues that students can reveal if they're stuck.
//                     </FormDescription>
//                   </div>
//                   <FormControl>
//                     <Switch checked={field.value} onCheckedChange={field.onChange} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <div className="flex justify-between">
//               <Button type="button" variant="outline" onClick={() => setActiveTab("format")}>
//                 Back
//               </Button>
//               <Button
//                 type="button"
//                 onClick={() => setActiveTab("advanced")}
//                 className="bg-emerald-600 hover:bg-emerald-700"
//               >
//                 Next: Advanced Options
//               </Button>
//             </div>
//           </TabsContent>

//           <TabsContent value="advanced" className="space-y-6 pt-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FormField
//                 control={form.control}
//                 name="enableFullscreen"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                     <div className="space-y-0.5">
//                       <FormLabel className="text-base">Enforce Fullscreen</FormLabel>
//                       <FormDescription>Require students to stay in fullscreen mode during the quiz.</FormDescription>
//                     </div>
//                     <FormControl>
//                       <Switch checked={field.value} onCheckedChange={field.onChange} />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="enableAntiCheat"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                     <div className="space-y-0.5">
//                       <FormLabel className="text-base">Anti-Cheat</FormLabel>
//                       <FormDescription>Detect tab switches and show warnings.</FormDescription>
//                     </div>
//                     <FormControl>
//                       <Switch checked={field.value} onCheckedChange={field.onChange} />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="randomizeQuestions"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                     <div className="space-y-0.5">
//                       <FormLabel className="text-base">Randomize Questions</FormLabel>
//                       <FormDescription>Shuffle the order of questions and answer options.</FormDescription>
//                     </div>
//                     <FormControl>
//                       <Switch checked={field.value} onCheckedChange={field.onChange} />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="flex justify-between">
//               <Button type="button" variant="outline" onClick={() => setActiveTab("learning")}>
//                 Back
//               </Button>
//               <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Generating Quiz...
//                   </>
//                 ) : (
//                   "Generate Quiz"
//                 )}
//               </Button>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </form>
//     </Form>
//   )
// }
