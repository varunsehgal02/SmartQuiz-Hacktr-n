// TakeQuizScreen.kt
package com.example.myapplication.ui.Screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.myapplication.ViewModels.QuizViewModel
import com.example.myapplication.network.Question
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TakeQuizScreen(
    navController: NavController,
    quizViewModel: QuizViewModel,
    quizId: String
) {
    val coroutineScope = rememberCoroutineScope()
    val quiz by quizViewModel.currentQuiz.collectAsState()
    val isLoading by quizViewModel.isLoading.collectAsState()

    // Track selected answers for each question
    val selectedAnswers = remember { mutableStateMapOf<Int, List<String>>() }

    // Load the quiz when the screen is first displayed
    LaunchedEffect(quizId) {
        quizViewModel.loadPublicQuizById(quizId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Take Quiz") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (quiz != null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp)
            ) {
                Text(
                    text = quiz?.title ?: "Quiz",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = quiz?.description ?: "",
                    style = MaterialTheme.typography.bodyMedium
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Questions
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                ) {
                    quiz?.questions?.let { questions ->
                        itemsIndexed(questions) { index, question ->
                            QuestionItem(
                                index = index,
                                question = question,
                                selectedAnswers = selectedAnswers[index] ?: emptyList(),
                                onAnswerSelected = { answers ->
                                    selectedAnswers[index] = answers
                                }
                            )

                            Divider(modifier = Modifier.padding(vertical = 16.dp))
                        }
                    }
                }

                // Submit button
                Button(
                    onClick = {
                        coroutineScope.launch {
                            quiz?.let { quiz ->
                                // Calculate score
                                var score = 0
                                quiz.questions.forEachIndexed { index, question ->
                                    val userAnswers = selectedAnswers[index] ?: emptyList()
                                    val correctAnswers = question.getCorrectAnswers()

                                    if (userAnswers.containsAll(correctAnswers) &&
                                        correctAnswers.containsAll(userAnswers)) {
                                        score++
                                    }
                                }

                                // Save the attempt
                                val currentUser = quizViewModel.getCurrentUser()
                                if (currentUser != null) {
                                    quizViewModel.recordQuizAttempt(
                                        quizId = quizId,
                                        studentEmail = currentUser.email ?: "",
                                        studentName = currentUser.displayName ?: "",
                                        score = score,
                                        totalQuestions = quiz.questions.size
                                    )
                                }

                                // Navigate to results screen
                                navController.navigate("quiz_results/${quizId}")
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Submit Answers")
                }
            }
        } else {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("Quiz not available or has expired")
            }
        }
    }
}

@Composable
fun QuestionItem(
    index: Int,
    question: Question,
    selectedAnswers: List<String>,
    onAnswerSelected: (List<String>) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "${index + 1}. ${question.getQuestionText()}",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))

        when (question.type) {
            "multiple_choice" -> {
                question.options?.forEach { option ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Checkbox(
                            checked = option in selectedAnswers,
                            onCheckedChange = { checked ->
                                val newAnswers = if (checked) {
                                    selectedAnswers + option
                                } else {
                                    selectedAnswers - option
                                }
                                onAnswerSelected(newAnswers)
                            }
                        )
                        Text(text = option)
                    }
                }
            }
            "single_choice" -> {
                question.options?.forEach { option ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        RadioButton(
                            selected = option == selectedAnswers.firstOrNull(),
                            onClick = {
                                onAnswerSelected(listOf(option))
                            }
                        )
                        Text(text = option)
                    }
                }
            }
            else -> {
                TextField(
                    value = selectedAnswers.firstOrNull() ?: "",
                    onValueChange = { onAnswerSelected(listOf(it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Your answer") }
                )
            }
        }
    }
}