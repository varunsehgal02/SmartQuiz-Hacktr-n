package com.example.myapplication.ui.Screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.myapplication.ViewModels.QuizViewModel
import com.example.myapplication.model.Quiz

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizListScreen(
    navController: NavController,
    quizViewModel: QuizViewModel,
    modifier: Modifier = Modifier
) {
    val quizzes by quizViewModel.quizzes.collectAsState()
    val isLoading by quizViewModel.isLoading.collectAsState()
    val errorMessage by quizViewModel.errorMessage.collectAsState()

    // For Go Live dialog
    var showGoLiveDialog by remember { mutableStateOf(false) }
    var selectedQuizId by remember { mutableStateOf("") }
    var durationMinutes by remember { mutableStateOf("30") }

    // Load quizzes when screen is first displayed
    LaunchedEffect(Unit) {
        quizViewModel.loadUserQuizzes()
    }

    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TopAppBar(
            title = { Text("My Quizzes") },
            navigationIcon = {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            }
        )

        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.padding(16.dp))
        } else if (quizzes.isEmpty()) {
            Text(
                "No quizzes found. Create your first quiz!",
                modifier = Modifier.padding(16.dp),
                style = MaterialTheme.typography.bodyLarge
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(8.dp)
            ) {
                items(quizzes) { quiz ->
                    QuizItem(
                        quiz = quiz,
                        onQuizClick = { navController.navigate("quiz_preview/${quiz.id}") },
                        onDeleteClick = { quizViewModel.deleteQuiz(it) },
                        onGoLiveClick = {
                            selectedQuizId = it
                            showGoLiveDialog = true
                        }
                    )
                }
            }
        }

        errorMessage?.let {
            Text(
                text = it,
                color = Color.Red,
                modifier = Modifier.padding(16.dp)
            )
        }

        FloatingActionButton(
            onClick = { navController.navigate("generate_quizz") },
            modifier = Modifier
                .align(Alignment.End)
                .padding(16.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Create Quiz")
        }

        // Go Live Dialog
        if (showGoLiveDialog) {
            AlertDialog(
                onDismissRequest = { showGoLiveDialog = false },
                title = { Text("Make Quiz Public") },
                text = {
                    Column {
                        Text("Set how long this quiz will be available to students:")
                        Spacer(modifier = Modifier.height(16.dp))
                        OutlinedTextField(
                            value = durationMinutes,
                            onValueChange = { durationMinutes = it },
                            label = { Text("Duration (minutes)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val duration = durationMinutes.toIntOrNull() ?: 30
                            quizViewModel.makeQuizPublic(selectedQuizId, duration)
                            showGoLiveDialog = false
                        }
                    ) {
                        Text("Confirm")
                    }
                },
                dismissButton = {
                    Button(onClick = { showGoLiveDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}


@Composable
fun QuizItem(
    quiz: Quiz,
    onQuizClick: () -> Unit,
    onDeleteClick: (String) -> Unit,
    onGoLiveClick: (String) -> Unit
) {
    var showQuizIdDialog by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .clickable(onClick = onQuizClick),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = quiz.title,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = quiz.description,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Display Quiz ID for sharing
            if (quiz.isPublic && quiz.publicUntil > System.currentTimeMillis()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.primaryContainer,
                        shape = MaterialTheme.shapes.small
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Quiz ID: ${quiz.id}",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            IconButton(
                                onClick = { showQuizIdDialog = true },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    Icons.Default.Menu,
                                    contentDescription = "Copy Quiz ID",
                                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                        }
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${quiz.questions.size} questions",
                    style = MaterialTheme.typography.bodySmall
                )

                Row {
                    // Go Live button
                    Button(
                        onClick = { onGoLiveClick(quiz.id) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (quiz.isPublic && quiz.publicUntil > System.currentTimeMillis())
                                Color.Red else Color(0xFF4CAF50)
                        ),
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Text(
                            if (quiz.isPublic && quiz.publicUntil > System.currentTimeMillis())
                                "Active" else "Go Live"
                        )
                    }

                    IconButton(onClick = { onDeleteClick(quiz.id) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete")
                    }
                }
            }

            // If quiz is live, show detailed status
            if (quiz.isPublic && quiz.publicUntil > System.currentTimeMillis()) {
                val remainingTime = quiz.publicUntil - System.currentTimeMillis()
                val remainingMinutes = remainingTime / (60 * 1000)
                val totalDuration = (quiz.publicUntil - quiz.lastActivatedAt) / (60 * 1000)
                val startTime = formatTimestamp(quiz.lastActivatedAt)

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                ) {
                    Surface(
                        color = Color(0xFFE8F5E9),
                        shape = MaterialTheme.shapes.small
                    ) {
                        Column(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)) {
                            Text(
                                text = "Status: LIVE",
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                color = Color(0xFF2E7D32)
                            )
                            Text(
                                text = "Started at: $startTime",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF2E7D32)
                            )
                            Text(
                                text = "Duration: $totalDuration minutes ($remainingMinutes min remaining)",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF2E7D32)
                            )
                        }
                    }
                }
            }
        }
    }

    // Quiz ID dialog for easy copying
    if (showQuizIdDialog) {
        AlertDialog(
            onDismissRequest = { showQuizIdDialog = false },
            title = { Text("Share Quiz ID") },
            text = {
                Column {
                    Text("Students can join using this ID:")
                    Spacer(modifier = Modifier.height(8.dp))
                    SelectionContainer {
                        Text(
                            text = quiz.id,
                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
                        )
                    }
                }
            },
            confirmButton = {
                Button(onClick = { showQuizIdDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

// Helper function to format timestamp to readable date/time
private fun formatTimestamp(timestamp: Long): String {
    val date = java.util.Date(timestamp)
    val format = java.text.SimpleDateFormat("MMM dd, HH:mm", java.util.Locale.getDefault())
    return format.format(date)
}