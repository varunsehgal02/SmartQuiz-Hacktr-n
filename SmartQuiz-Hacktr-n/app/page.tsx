import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, CheckCircle, FileText, Layers, UserPlus } from "lucide-react"
import Link from "next/link"
import { NameEntryModal } from "@/components/name-entry-modal"
import { JoinQuizCard } from "@/components/join-quiz-card"
import { SelfQuizCard } from "@/components/self-quiz-card"
import { AuthNav } from "@/components/auth-nav"
import { AIQuizForm } from "@/components/ai-quiz-form"

export default function Home() {
  return (
    <div className="flex min-h-screen w-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">SmartQuiz Architect</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <AuthNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Generate Quizzes with AI in Seconds
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SmartQuiz Architect helps teachers create customized quizzes with just a simple prompt. Generate
                  multiple question types, set difficulty levels, and export to PDF instantly.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="#generate-quiz">
                      Create Quiz <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#join-quiz">Join Quiz</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 lg:ml-auto">
                <div className="rounded-lg border bg-background p-8 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-medium">Example Prompts</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="rounded-md bg-gray-50 p-3">
                      "10 easy questions on Newton's Laws focusing on application and analysis levels."
                    </li>
                    <li className="rounded-md bg-gray-50 p-3">
                      "Create a 15-question medium-difficulty quiz on Photosynthesis."
                    </li>
                    <li className="rounded-md bg-gray-50 p-3">
                      "5 hard questions about World War II with a mix of multiple choice and short answer."
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful Quiz Generation</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Create customized quizzes tailored to your teaching needs with our advanced AI technology.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Layers className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Multiple Question Types</h3>
                <p className="text-center text-gray-500">
                  Generate MCQs, True/False, Short Answer, and Fill-in-the-blank questions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Bloom's Taxonomy</h3>
                <p className="text-center text-gray-500">
                  Questions tagged with cognitive levels from Remember to Create.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-emerald-100 p-3">
                  <UserPlus className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Student Self-Practice</h3>
                <p className="text-center text-gray-500">Students can create their own practice quizzes.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="join-quiz" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join or Create</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join a quiz with a code or create your own practice quiz.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              <JoinQuizCard />
              <SelfQuizCard />
            </div>
          </div>
        </section>

        <section id="generate-quiz" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Generate Your Quiz</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Enter your quiz requirements below and let our AI create the perfect quiz for your students.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-8">
              <AIQuizForm />
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <span className="font-bold">SmartQuiz Architect</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SmartQuiz Architect. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-8">
            <div className="space-y-2">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Help</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-gray-900">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Name Entry Modal */}
      <NameEntryModal />
    </div>
  )
}
