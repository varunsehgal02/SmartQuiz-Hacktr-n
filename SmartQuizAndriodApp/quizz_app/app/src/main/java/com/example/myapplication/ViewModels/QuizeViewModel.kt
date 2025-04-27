package com.example.myapplication.ViewModels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.model.Quiz
import com.example.myapplication.model.QuizAttempt
import com.example.myapplication.model.QuizRepository
import com.example.myapplication.network.NLPApiService
import com.example.myapplication.network.Question
import com.example.myapplication.network.QuizParams
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.firestore
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlin.text.get

class QuizViewModel : ViewModel() {
    private val quizRepository = QuizRepository()
    private val nlpApiService = NLPApiService.create()

    private val _questions = MutableStateFlow<List<Question>>(emptyList())
    val questions: StateFlow<List<Question>> = _questions.asStateFlow()

    private val _quizzes = MutableStateFlow<List<Quiz>>(emptyList())
    val quizzes: StateFlow<List<Quiz>> = _quizzes.asStateFlow()

    private val _currentQuiz = MutableStateFlow<Quiz?>(null)
    val currentQuiz: StateFlow<Quiz?> = _currentQuiz

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // Add connection status state
    private val _connectionStatus = MutableStateFlow(true)
    val connectionStatus: StateFlow<Boolean> = _connectionStatus.asStateFlow()

    // For quiz attempts
    private val _userAttempts = MutableStateFlow<List<QuizAttempt>>(emptyList())
    val userAttempts: StateFlow<List<QuizAttempt>> = _userAttempts

    // For public quiz status
    private val _quizPublicStatus = MutableStateFlow<Boolean?>(null)
    val quizPublicStatus: StateFlow<Boolean?> = _quizPublicStatus

    private fun setLoading(isLoading: Boolean) {
        _isLoading.value = isLoading
    }

    private fun setError(message: String?) {
        _errorMessage.value = message
    }

    // Updated method to match what's called from the UI
    suspend fun generateQuiz(params: QuizParams): Boolean {
        _isLoading.value = true
        _errorMessage.value = null

        return try {
            val response = nlpApiService.generateQuiz(params)
            if (response.isSuccessful) {
                response.body()?.let { questions ->
                    _questions.value = questions
                    true
                } ?: run {
                    _errorMessage.value = "Empty response from server"
                    false
                }
            } else {
                _errorMessage.value = "Error: ${response.code()} - ${response.message()}"
                false
            }
        } catch (e: Exception) {
            _connectionStatus.value = false
            _errorMessage.value = "Failed to generate questions: ${e.message}"
            false
        } finally {
            _isLoading.value = false
            _connectionStatus.value = true
        }
    }

    suspend fun saveCurrentQuizToFirestore(title: String, description: String): Boolean {
        setLoading(true)
        return try {
            val currentUser = Firebase.auth.currentUser
            if (currentUser == null) {
                setError("User not logged in")
                return false
            }

            val quiz = Quiz(
                title = title,
                description = description,
                questions = questions.value,
                adminAccess = listOf(currentUser.email ?: ""),
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )

            // Save the quiz and get its ID
            val quizId = quizRepository.saveQuiz(quiz)

            if (quizId != null) {
                // Update the user document to add this quiz ID
                val db = Firebase.firestore
                val userRef = db.collection("users").document(currentUser.uid)

                // Use arrayUnion to add the quiz ID to the user's quizzes array
                userRef.update("quizzes", FieldValue.arrayUnion(quizId))
                    .addOnFailureListener { e ->
                        setError("Quiz saved but failed to update user profile: ${e.message}")
                    }

                // Refresh the quiz list
                loadUserQuizzes()
                true
            } else {
                setError("Failed to save quiz")
                false
            }
        } catch (e: Exception) {
            setError("Error saving quiz: ${e.message}")
            false
        } finally {
            setLoading(false)
        }
    }

    fun loadUserQuizzes() {
        viewModelScope.launch {
            setLoading(true)
            try {
                val currentUser = Firebase.auth.currentUser
                if (currentUser != null && currentUser.email != null) {
                    quizRepository.getQuizzesByUser(currentUser.email!!)
                        .collect { quizList ->
                            _quizzes.value = quizList
                        }
                } else {
                    setError("User not logged in or no email available")
                    _quizzes.value = emptyList()
                }
            } catch (e: Exception) {
                setError("Failed to load quizzes: ${e.message}")
                _quizzes.value = emptyList()
            } finally {
                setLoading(false)
            }
        }
    }

    fun loadQuizById(quizId: String) {
        viewModelScope.launch {
            setLoading(true)
            try {
                val quiz = quizRepository.getQuizById(quizId)
                if (quiz != null) {
                    _currentQuiz.value = quiz
                    _questions.value = quiz.questions
                } else {
                    _errorMessage.value = "Quiz not found"
                }
            } catch (e: Exception) {
                _errorMessage.value = "Error loading quiz: ${e.message}"
            } finally {
                setLoading(false)
            }
        }
    }

    fun loadPublicQuizById(quizId: String) {
        viewModelScope.launch {
            setLoading(true)
            try {
                val quiz = quizRepository.getQuizByIdPublic(quizId)
                _currentQuiz.value = quiz
                if (quiz != null) {
                    _questions.value = quiz.questions
                } else {
                    setError("Quiz not found or is not available")
                }
            } catch (e: Exception) {
                setError("Error loading quiz: ${e.message}")
            } finally {
                setLoading(false)
            }
        }
    }

    fun deleteQuiz(quizId: String) {
        viewModelScope.launch {
            setLoading(true)
            try {
                val success = quizRepository.deleteQuiz(quizId)
                if (!success) {
                    setError("Failed to delete quiz")
                } else {
                    // Refresh the list after deletion
                    loadUserQuizzes()
                }
            } catch (e: Exception) {
                setError("Error deleting quiz: ${e.message}")
            } finally {
                setLoading(false)
            }
        }
    }

    fun makeQuizPublic(quizId: String, durationMinutes: Int) {
        viewModelScope.launch {
            setLoading(true)
            try {
                val result = quizRepository.makeQuizPublic(quizId, durationMinutes)
                _quizPublicStatus.value = result
                if (result) {
                    // Refresh the quiz list to show updated status
                    loadUserQuizzes()
                }
            } catch (e: Exception) {
                setError("Failed to make quiz public: ${e.message}")
            } finally {
                setLoading(false)
            }
        }
    }

    fun getCurrentUser() = Firebase.auth.currentUser

    fun recordQuizAttempt(quizId: String, studentEmail: String, studentName: String, score: Int, totalQuestions: Int) {
        viewModelScope.launch {
            try {
                quizRepository.recordQuizAttempt(
                    quizId = quizId,
                    studentEmail = studentEmail,
                    studentName = studentName,
                    score = score,
                    totalQuestions = totalQuestions
                )
            } catch (e: Exception) {
                setError("Failed to record attempt: ${e.message}")
            }
        }
    }

    fun loadUserQuizAttempts(quizId: String) {
        viewModelScope.launch {
            setLoading(true)
            try {
                val quiz = quizRepository.getQuizById(quizId)
                val currentUser = Firebase.auth.currentUser

                if (quiz != null && currentUser != null) {
                    val email = currentUser.email ?: ""
                    val userAttempts = quiz.studentAttempts.filter { it.studentEmail == email }
                    _userAttempts.value = userAttempts
                } else {
                    _userAttempts.value = emptyList()
                }
            } catch (e: Exception) {
                setError("Error loading attempts: ${e.message}")
                _userAttempts.value = emptyList()
            } finally {
                setLoading(false)
            }
        }
    }

    fun clearCurrentQuiz() {
        _currentQuiz.value = null
        _questions.value = emptyList()
    }
}