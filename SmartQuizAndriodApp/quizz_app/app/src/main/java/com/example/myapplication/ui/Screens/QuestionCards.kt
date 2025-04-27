package com.example.myapplication.ui.Screens

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.network.Question

@Composable
fun QuestionHeader(
    questionNumber: Int,
    question: Question,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        // Question number and bloom level row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Question $questionNumber",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
            question.bloom_level?.let {
                BloomLevelChip(bloomLevel = it)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Question text
        Text(
            text = question.getQuestionText(),
            fontSize = 16.sp,
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
}

@Composable
fun BloomLevelChip(bloomLevel: String) {
    val color = when (bloomLevel.lowercase()) {
        "remember" -> MaterialTheme.colorScheme.primary
        "understand" -> MaterialTheme.colorScheme.secondary
        "apply" -> MaterialTheme.colorScheme.tertiary
        "analyze" -> MaterialTheme.colorScheme.error
        "evaluate" -> MaterialTheme.colorScheme.secondaryContainer
        "create" -> MaterialTheme.colorScheme.tertiaryContainer
        else -> MaterialTheme.colorScheme.outline
    }

    Surface(
        modifier = Modifier.clip(RoundedCornerShape(16.dp)),
        color = color.copy(alpha = 0.2f)
    ) {
        Text(
            text = bloomLevel,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            color = color,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun ExplanationSection(
    explanation: String?,
    modifier: Modifier = Modifier
) {
    var showExplanation by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        TextButton(
            onClick = { showExplanation = !showExplanation },
            modifier = Modifier.align(Alignment.End)
        ) {
            Text(if (showExplanation) "Hide Explanation" else "Show Explanation")
        }

        if (showExplanation) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .border(
                        width = 1.dp,
                        color = MaterialTheme.colorScheme.outlineVariant,
                        shape = RoundedCornerShape(4.dp)
                    ),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Text(
                    text = explanation ?: "No explanation available",
                    modifier = Modifier.padding(12.dp),
                    fontSize = 14.sp
                )
            }
        }
    }
}

@Composable
fun MultipleChoiceQuestionCard(
    questionNumber: Int,
    question: Question,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            QuestionHeader(
                questionNumber = questionNumber,
                question = question
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Multiple choice options
            val options = question.options ?: emptyList()
            var selectedOption by remember { mutableStateOf<String?>(null) }

            Column(modifier = Modifier.selectableGroup()) {
                options.forEach { option ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .selectable(
                                selected = (option == selectedOption),
                                onClick = { selectedOption = option },
                                role = Role.RadioButton
                            )
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = (option == selectedOption),
                            onClick = null // null because we're handling the click in the Row
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = option)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            ExplanationSection(
                explanation = question.explanation
            )
        }
    }
}

@Composable
fun TrueFalseQuestionCard(
    questionNumber: Int,
    question: Question,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            QuestionHeader(
                questionNumber = questionNumber,
                question = question
            )

            Spacer(modifier = Modifier.height(12.dp))

            // True/False options
            var selectedOption by remember { mutableStateOf<Boolean?>(null) }

            Column(modifier = Modifier.selectableGroup()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .selectable(
                            selected = (selectedOption == true),
                            onClick = { selectedOption = true },
                            role = Role.RadioButton
                        )
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = (selectedOption == true),
                        onClick = null
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "True")
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .selectable(
                            selected = (selectedOption == false),
                            onClick = { selectedOption = false },
                            role = Role.RadioButton
                        )
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = (selectedOption == false),
                        onClick = null
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "False")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            ExplanationSection(
                explanation = question.explanation
            )
        }
    }
}

@Composable
fun ShortAnswerQuestionCard(
    questionNumber: Int,
    question: Question,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            QuestionHeader(
                questionNumber = questionNumber,
                question = question
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Short answer input
            var answer by remember { mutableStateOf("") }

            OutlinedTextField(
                value = answer,
                onValueChange = { answer = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Your Answer") },
                singleLine = true
            )

            Spacer(modifier = Modifier.height(8.dp))

            ExplanationSection(
                explanation = question.explanation
            )
        }
    }
}

@Composable
fun LongAnswerQuestionCard(
    questionNumber: Int,
    question: Question,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
        ) {
            QuestionHeader(
                questionNumber = questionNumber,
                question = question
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Long answer input
            var answer by remember { mutableStateOf("") }

            OutlinedTextField(
                value = answer,
                onValueChange = { answer = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                label = { Text("Your Answer") },
                singleLine = false
            )

            Spacer(modifier = Modifier.height(8.dp))

            ExplanationSection(
                explanation = question.explanation
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MultipleChoiceQuestionCardPreview() {
    val sampleMcqQuestion = Question(
        type = "MCQ",
        question = "What is the output when the following code snippet is executed? int a = 5; cout << a++;",
        options = listOf("5", "6", "4", "7"),
        correct_answer = listOf("6"),
        bloom_level = "Remember",
        explanation = "The operator ++ increments the value of a by 1. After executing a++, variable a will have the value 6."
    )

    MaterialTheme {
        MultipleChoiceQuestionCard(
            questionNumber = 1,
            question = sampleMcqQuestion
        )
    }
}

@Preview(showBackground = true)
@Composable
fun TrueFalseQuestionCardPreview() {
    val sampleTrueFalseQuestion = Question(
        type = "True/False",
        question = "In C++, the '==' operator is used for assignment.",
        options = listOf("True", "False"),
        correct_answer = listOf("False"),
        bloom_level = "Understand",
        explanation = "In C++, the '=' operator is used for assignment, while '==' is used for equality comparison."
    )

    MaterialTheme {
        TrueFalseQuestionCard(
            questionNumber = 2,
            question = sampleTrueFalseQuestion
        )
    }
}

@Preview(showBackground = true)
@Composable
fun ShortAnswerQuestionCardPreview() {
    val sampleShortAnswerQuestion = Question(
        type = "Short Answer",
        question = "What does 'OOP' stand for in programming?",
        correct_answer = "Object-Oriented Programming",
        bloom_level = "Remember",
        explanation = "OOP stands for Object-Oriented Programming, a programming paradigm based on the concept of 'objects'."
    )

    MaterialTheme {
        ShortAnswerQuestionCard(
            questionNumber = 3,
            question = sampleShortAnswerQuestion
        )
    }
}

@Preview(showBackground = true)
@Composable
fun LongAnswerQuestionCardPreview() {
    val sampleLongAnswerQuestion = Question(
        type = "Long Answer",
        question = "Explain the concept of polymorphism in object-oriented programming and provide an example.",
        correct_answer = "Polymorphism is the ability of different objects to respond to the same message in different ways...",
        bloom_level = "Create",
        explanation = "Polymorphism allows objects of different classes to be treated as objects of a common superclass. The most common use is when a parent class reference is used to refer to a child class object."
    )

    MaterialTheme {
        LongAnswerQuestionCard(
            questionNumber = 4,
            question = sampleLongAnswerQuestion
        )
    }
}

@Preview(showBackground = true)
@Composable
fun QuestionHeaderPreview() {
    val sampleQuestion = Question(
        type = "MCQ",
        question = "What is the purpose of a constructor in C++?",
        bloom_level = "Apply"
    )

    MaterialTheme {
        QuestionHeader(
            questionNumber = 5,
            question = sampleQuestion
        )
    }
}

@Preview(showBackground = true)
@Composable
fun BloomLevelChipPreview() {
    MaterialTheme {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(8.dp)
        ) {
            BloomLevelChip(bloomLevel = "Remember")
            BloomLevelChip(bloomLevel = "Understand")
            BloomLevelChip(bloomLevel = "Apply")
            BloomLevelChip(bloomLevel = "Analyze")
            BloomLevelChip(bloomLevel = "Evaluate")
            BloomLevelChip(bloomLevel = "Create")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ExplanationSectionPreview() {
    MaterialTheme {
        ExplanationSection(
            explanation = "This is a sample explanation that helps students understand the concept being tested in the question.",
            modifier = Modifier.padding(8.dp)
        )
    }
}

@Composable
fun QuestionCard(
    questionNumber: Int,
    question: Question,
    modifier: Modifier = Modifier
) {
    when (question.type.lowercase()) {
        "mcq" -> MultipleChoiceQuestionCard(questionNumber, question, modifier)
        "true/false", "true false" -> TrueFalseQuestionCard(questionNumber, question, modifier)
        "short answer" -> ShortAnswerQuestionCard(questionNumber, question, modifier)
        else -> LongAnswerQuestionCard(questionNumber, question, modifier)
    }
}

@Preview(showBackground = true)
@Composable
fun QuestionCardPreview() {
    // Sample questions of different types to preview the QuestionCard router function
    val questions = listOf(
        Question(
            type = "MCQ",
            question = "Which keyword is used to define a constant in C++?",
            options = listOf("var", "let", "const", "final"),
            correct_answer = listOf("const"),
            bloom_level = "Remember"
        ),
        Question(
            type = "True/False",
            question = "Arrays in C++ are zero-indexed.",
            correct_answer = listOf("True"),
            bloom_level = "Understand"
        ),
        Question(
            type = "Short Answer",
            question = "What function is used to dynamically allocate memory in C++?",
            correct_answer = "new",
            bloom_level = "Apply"
        )
    )

    MaterialTheme {
        Column {
            questions.forEachIndexed { index, question ->
                QuestionCard(
                    questionNumber = index + 1,
                    question = question,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}


