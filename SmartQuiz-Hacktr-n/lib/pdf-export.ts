import { jsPDF } from "jspdf"

export function exportToPdf(quizData: any) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text(quizData.title, 14, 20)

  // Add description
  doc.setFontSize(12)
  doc.text(quizData.description, 14, 30)

  // Add quiz questions
  doc.setFontSize(14)
  doc.text("Quiz Questions", 14, 45)

  let yPos = 55

  quizData.questions.forEach((question: any, index: number) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    // Add question
    doc.setFontSize(12)
    doc.text(`${index + 1}. ${question.question}`, 14, yPos)
    yPos += 10

    // Add options based on question type
    if (question.type === "mcq" && question.options) {
      question.options.forEach((option: string, optIndex: number) => {
        doc.setFontSize(10)
        doc.text(`   ${String.fromCharCode(65 + optIndex)}. ${option}`, 14, yPos)
        yPos += 7
      })
    } else if (question.type === "true-false") {
      doc.setFontSize(10)
      doc.text("   True", 14, yPos)
      yPos += 7
      doc.text("   False", 14, yPos)
      yPos += 7
    } else if (question.type === "short-answer" || question.type === "fill-in-blank") {
      doc.setFontSize(10)
      doc.text("   Answer: ____________________", 14, yPos)
      yPos += 7
    } else if (question.type === "matching") {
      doc.setFontSize(10)
      const halfLength = Math.ceil(question.options.length / 2)

      for (let i = 0; i < halfLength; i++) {
        doc.text(`   ${String.fromCharCode(65 + i)}. ${question.options[i]}`, 14, yPos)
        if (i + halfLength < question.options.length) {
          doc.text(`   ${i + 1}. ${question.options[i + halfLength]}`, 100, yPos)
        }
        yPos += 7
      }
    }

    yPos += 5
  })

  // Add a new page for answer key
  doc.addPage()

  // Add answer key title
  doc.setFontSize(18)
  doc.text("Answer Key: " + quizData.title, 14, 20)

  yPos = 35

  quizData.questions.forEach((question: any, index: number) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    // Add question
    doc.setFontSize(12)
    doc.text(`${index + 1}. ${question.question}`, 14, yPos)
    yPos += 10

    // Add answer
    doc.setFontSize(10)
    let answerText = "Answer: "

    if (question.type === "mcq") {
      if (typeof question.answer === "number" && question.options) {
        answerText += question.options[question.answer]
      } else {
        answerText += question.answer
      }
    } else if (question.type === "true-false") {
      answerText += question.answer ? "True" : "False"
    } else {
      answerText += question.answer
    }

    doc.text(answerText, 14, yPos)
    yPos += 7

    // Add explanation if available
    if (question.explanation) {
      const explanationLines = doc.splitTextToSize("Explanation: " + question.explanation, 180)
      doc.text(explanationLines, 14, yPos)
      yPos += 7 * explanationLines.length
    }

    yPos += 5
  })

  // Save the PDF
  doc.save(`${quizData.title.replace(/\s+/g, "_")}.pdf`)
}
