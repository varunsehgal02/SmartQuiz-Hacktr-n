package com.example.myapplication.ui.Screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.myapplication.ViewModels.QuizViewModel
import com.example.myapplication.network.Question
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizPreviewScreen(
    navController: NavController,
    quizViewModel: QuizViewModel = viewModel(),
    quizId: String = ""
) {
    val questions by quizViewModel.questions.collectAsState()
    val isLoading by quizViewModel.isLoading.collectAsState()
    val errorMessage by quizViewModel.errorMessage.collectAsState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var showSaveDialog by remember { mutableStateOf(false) }
    var quizTitle by remember { mutableStateOf("") }
    var quizDescription by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Quiz Preview") },
                navigationIcon = {
                    IconButton(onClick = { navController.navigateUp() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(
                        onClick = { showSaveDialog = true },
                        enabled = questions.isNotEmpty()
                    ) {
                        Icon(Icons.Default.Check, contentDescription = "Save Quiz")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            } else if (questions.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = errorMessage ?: "No questions generated yet",
                        textAlign = TextAlign.Center,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { navController.navigateUp() }
                    ) {
                        Text("Go back and try again")
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    items(questions) { question ->
                        QuestionCard(question)
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                        Button(
                            onClick = { showSaveDialog = true },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Save Quiz")
                        }
                        Spacer(modifier = Modifier.height(32.dp))
                    }
                }
            }

            // Save Dialog
            if (showSaveDialog) {
                SaveQuizDialog(
                    quizTitle = quizTitle,
                    onQuizTitleChange = { quizTitle = it },
                    quizDescription = quizDescription,
                    onQuizDescriptionChange = { quizDescription = it },
                    onDismiss = { showSaveDialog = false },
                    onSave = {
                        scope.launch {
                            val success = quizViewModel.saveCurrentQuizToFirestore(quizTitle, quizDescription)
                            if (success) {
                                showSaveDialog = false
                                navController.navigate("quiz_list")
                            }
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun QuestionCard(question: Question) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Type: ${question.type}",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )

            if (question.bloom_level != null) {
                Text(
                    text = "Bloom Level: ${question.bloom_level}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.secondary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = question.getQuestionText(),
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (!question.options.isNullOrEmpty()) {
                val correctAnswers = question.getCorrectAnswers()

                question.options.forEach { option ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val isCorrect = correctAnswers.contains(option)

                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isCorrect) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isCorrect) {
                                Icon(
                                    Icons.Default.Check,
                                    contentDescription = "Correct Answer",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        Text(
                            text = option,
                            color = if (isCorrect) MaterialTheme.colorScheme.primary else Color.Unspecified
                        )
                    }
                }
            } else if (question.type == "Short Answer") {
                Text(
                    text = "Answer Input Required",
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (question.explanation != null) {
                Text(
                    text = "Explanation:",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )

                Text(
                    text = question.explanation,
                    fontSize = 14.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SaveQuizDialog(
    quizTitle: String,
    onQuizTitleChange: (String) -> Unit,
    quizDescription: String,
    onQuizDescriptionChange: (String) -> Unit,
    onDismiss: () -> Unit,
    onSave: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxWidth()
            ) {
                Text(
                    text = "Save Quiz",
                    style = MaterialTheme.typography.headlineSmall
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = quizTitle,
                    onValueChange = onQuizTitleChange,
                    label = { Text("Quiz Title") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = quizDescription,
                    onValueChange = onQuizDescriptionChange,
                    label = { Text("Description") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = onSave,
                        enabled = quizTitle.isNotBlank()
                    ) {
                        Text("Save")
                    }
                }
            }
        }
    }
}