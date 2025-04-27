package com.example.myapplication.ui.Screens

import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.myapplication.ViewModels.QuizViewModel
import com.example.myapplication.network.QuizParams
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GenerateQuizz(modifier: Modifier = Modifier, quizViewModel: QuizViewModel ,navController : NavController) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    // Get states from ViewModel
    val isLoading by quizViewModel.isLoading.collectAsState()
    val connectionStatus by quizViewModel.connectionStatus.collectAsState()
    val errorMessage by quizViewModel.errorMessage.collectAsState()

    // Quiz parameters
    var nlpPrompt by remember { mutableStateOf("") }
    var numQuestions by remember { mutableStateOf("5") }
    var selectedDifficulty by remember { mutableStateOf("Medium") }
    val difficulties = listOf("Easy", "Medium", "Hard")

    // Question types selection
    val questionTypes = listOf("MCQ", "TrueFalse", "OneWord", "LongAnswer")
    val selectedQuestionTypes = remember { mutableStateListOf("MCQ") }

    var progressiveBloom by remember { mutableStateOf(true) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Generate Quiz",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )

        // NLP Prompt
        OutlinedTextField(
            value = nlpPrompt,
            onValueChange = { nlpPrompt = it },
            label = { Text("Quiz Prompt") },
            placeholder = { Text("Enter a prompt for quiz generation (e.g., Make a quiz on Array DataStructure)") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            enabled = !isLoading
        )

        // Number of Questions
        OutlinedTextField(
            value = numQuestions,
            onValueChange = {
                // Only allow numeric input
                if (it.isEmpty() || it.matches(Regex("\\d+"))) {
                    numQuestions = it
                }
            },
            label = { Text("Number of Questions") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number
            ),
            enabled = !isLoading
        )

        // Difficulty Selection
        Text("Difficulty", fontWeight = FontWeight.Medium)
        Row(
            modifier = Modifier.selectableGroup(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            difficulties.forEach { difficulty ->
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = difficulty == selectedDifficulty,
                        onClick = { selectedDifficulty = difficulty },
                        enabled = !isLoading
                    )
                    Text(
                        text = difficulty,
                        modifier = Modifier.padding(start = 4.dp, end = 16.dp)
                    )
                }
            }
        }

        // Question Types
        Text("Question Types (Select at least one)", fontWeight = FontWeight.Medium)
        questionTypes.forEach { type ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Checkbox(
                    checked = selectedQuestionTypes.contains(type),
                    onCheckedChange = { checked ->
                        if (checked) {
                            if (!selectedQuestionTypes.contains(type)) {
                                selectedQuestionTypes.add(type)
                            }
                        } else {
                            // Don't allow removing the last selected type
                            if (selectedQuestionTypes.size > 1) {
                                selectedQuestionTypes.remove(type)
                            }
                        }
                    },
                    enabled = !isLoading
                )
                Text(
                    text = when(type) {
                        "MCQ" -> "Multiple Choice Questions"
                        "TrueFalse" -> "True/False Questions"
                        "OneWord" -> "One Word Answer"
                        "LongAnswer" -> "Long Answer"
                        else -> type
                    }
                )
            }
        }

        // Progressive Bloom
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "Progressive Bloom Taxonomy",
                modifier = Modifier.weight(1f)
            )
            Switch(
                checked = progressiveBloom,
                onCheckedChange = { progressiveBloom = it },
                enabled = !isLoading
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Generate Quiz Button
        Button(
            onClick = {
                if (nlpPrompt.isBlank()) {
                    Toast.makeText(context, "Please enter a prompt", Toast.LENGTH_SHORT).show()
                    return@Button
                }

                val numQuestionsInt = numQuestions.toIntOrNull() ?: 5

                val params = QuizParams(
                    nlpPrompt = nlpPrompt,
                    numQuestions = numQuestionsInt,
                    difficulty = selectedDifficulty,
                    questionTypes = selectedQuestionTypes.toList(),
                    progressiveBloom = progressiveBloom
                )

                coroutineScope.launch {
                    Toast.makeText(
                        context,
                        "Generating quiz... This may take up to 2 minutes for complex prompts.",
                        Toast.LENGTH_LONG
                    ).show()

                    Log.d("GenerateQuizz", "Sending quiz parameters to server: $params")
                    val success = quizViewModel.generateQuiz(params)

                    if (success) {
                        navController.navigate("quiz_preview")
                    } else {
                        val error = quizViewModel.errorMessage.value ?: "Unknown error"
                        Toast.makeText(context, error, Toast.LENGTH_LONG).show()
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary,
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Generating...")
            } else {
                Text("Generate Quiz")
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun GenerateQuizzPreview() {
    GenerateQuizz(
        modifier = Modifier.fillMaxSize(),
        quizViewModel = viewModel<QuizViewModel>(),
        navController = NavController(LocalContext.current))
}