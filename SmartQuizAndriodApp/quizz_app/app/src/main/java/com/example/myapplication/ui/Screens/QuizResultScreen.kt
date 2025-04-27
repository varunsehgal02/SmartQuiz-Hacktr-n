// QuizResultsScreen.kt
package com.example.myapplication.ui.Screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.myapplication.ViewModels.QuizViewModel
import com.example.myapplication.network.Question

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizResultsScreen(
    navController: NavController,
    quizViewModel: QuizViewModel,
    quizId: String
) {
    val quiz by quizViewModel.currentQuiz.collectAsState()
    val isLoading by quizViewModel.isLoading.collectAsState()
    val userAttempts by quizViewModel.userAttempts.collectAsState()

    LaunchedEffect(quizId) {
        quizViewModel.loadQuizById(quizId)
        quizViewModel.loadUserQuizAttempts(quizId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Quiz Results") },
                navigationIcon = {
                    IconButton(onClick = { navController.navigate("home") }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Home")
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
                    text = quiz?.title ?: "Quiz Results",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Find user's attempt
                val userAttempt = userAttempts.firstOrNull()

                userAttempt?.let { attempt ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Your Score",
                                style = MaterialTheme.typography.titleMedium
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "${attempt.score}/${attempt.totalQuestions}",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            val percentage = (attempt.score.toFloat() / attempt.totalQuestions) * 100
                            Text(
                                text = "Percentage: ${percentage.toInt()}%",
                                style = MaterialTheme.typography.titleMedium
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                } ?: Text(
                    text = "No attempt found for this quiz",
                    style = MaterialTheme.typography.bodyLarge
                )

                // Display explanation for each question
                Text(
                    text = "Question Explanations",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 16.dp)
                )

                LazyColumn(
                    modifier = Modifier.weight(1f)
                ) {
                    quiz?.questions?.let { questions ->
                        itemsIndexed(questions) { index, question ->
                            QuestionExplanationItem(
                                index = index,
                                question = question
                            )

                            Divider(modifier = Modifier.padding(vertical = 16.dp))
                        }
                    }
                }

                Button(
                    onClick = { navController.navigate("home") },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Return to Home")
                }
            }
        } else {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("Quiz not found")
            }
        }
    }
}

@Composable
fun QuestionExplanationItem(
    index: Int,
    question: Question
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "${index + 1}. ${question.getQuestionText()}",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(vertical = 4.dp)
        ) {
            Text(
                text = "Correct answer: ",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = question.getCorrectAnswers().joinToString(", "),
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (!question.explanation.isNullOrBlank()) {
            Text(
                text = "Explanation:",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = question.explanation,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}