package com.example.myapplication.model



import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.firestore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class QuizRepository @Inject constructor() {
    private val firestore = FirebaseFirestore.getInstance()
    private val quizCollection = firestore.collection("quizzes")

    suspend fun saveQuiz(quiz: Quiz): String? {
        return try {
            val db = Firebase.firestore
            val quizzesCollection = db.collection("quizzes")

            // If the quiz has an ID, update the existing document
            if (quiz.id.isNotBlank()) {
                quizzesCollection.document(quiz.id).set(quiz).await()
                quiz.id
            } else {
                // Otherwise, create a new document and return its ID
                val docRef = quizzesCollection.add(quiz).await()
                docRef.id
            }
        } catch (e: Exception) {
            null
        }
    }

    fun getQuizzesByUser(userEmail: String): Flow<List<Quiz>> = flow {
        try {
            // Log for debugging
            Log.d("QuizRepository", "Fetching quizzes for user: $userEmail")

            val snapshot = quizCollection
                .whereArrayContains("adminAccess", userEmail)
                .get()
                .await()

            // Log document count
            Log.d("QuizRepository", "Received ${snapshot.documents.size} quiz documents")

            val quizzes = snapshot.documents.mapNotNull { doc ->
                try {
                    Log.d("QuizRepository", "Converting document ${doc.id}")
                    val quiz = doc.toObject(Quiz::class.java)
                    quiz?.also {
                        it.id = doc.id
                        Log.d("QuizRepository", "Successfully mapped quiz: ${it.title}")
                    }
                } catch (e: Exception) {
                    Log.e("QuizRepository", "Failed to convert document ${doc.id}: ${e.message}")
                    null
                }
            }

            Log.d("QuizRepository", "Emitting ${quizzes.size} quizzes")
            emit(quizzes)
        } catch (e: Exception) {
            Log.e("QuizRepository", "Error fetching quizzes: ${e.message}", e)
            emit(emptyList())
        }
    }.flowOn(Dispatchers.IO)


    suspend fun getQuizById(quizId: String): Quiz? {
        return try {
            val doc = quizCollection.document(quizId).get().await()
            doc.toObject(Quiz::class.java)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun deleteQuiz(quizId: String): Boolean {
        return try {
            quizCollection.document(quizId).delete().await()
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun makeQuizPublic(quizId: String, durationMinutes: Int): Boolean {
        return try {
            val currentTime = System.currentTimeMillis()
            val expiryTime = currentTime + (durationMinutes * 60 * 1000)

            quizCollection.document(quizId)
                .update(mapOf(
                    "isPublic" to true,
                    "publicUntil" to expiryTime,
                    "lastActivatedAt" to currentTime
                ))
                .await()
            true
        } catch (e: Exception) {
            Log.e("QuizRepository", "Error making quiz public: ${e.message}")
            false
        }
    }


    suspend fun getQuizByIdPublic(quizId: String): Quiz? {
        return try {
            val doc = quizCollection.document(quizId).get().await()
            val quiz = doc.toObject(Quiz::class.java)?.apply { id = doc.id }

            // Check if quiz exists and is currently public
            if (quiz != null && quiz.isPublic && quiz.publicUntil > System.currentTimeMillis()) {
                quiz
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e("QuizRepository", "Error fetching quiz: ${e.message}")
            null
        }
    }

    suspend fun recordQuizAttempt(quizId: String, studentEmail: String, studentName: String, score: Int, totalQuestions: Int): Boolean {
        return try {
            val attempt = QuizAttempt(
                studentEmail = studentEmail,
                studentName = studentName,
                timestamp = System.currentTimeMillis(),
                score = score,
                totalQuestions = totalQuestions
            )

            // Add the attempt to the quiz document
            quizCollection.document(quizId).update(
                "studentAttempts", com.google.firebase.firestore.FieldValue.arrayUnion(attempt)
            ).await()

            // Also record this quiz in the user's document
            Firebase.firestore.collection("users").document(studentEmail)
                .update("attemptedQuizIds", com.google.firebase.firestore.FieldValue.arrayUnion(quizId))
                .await()

            true
        } catch (e: Exception) {
            Log.e("QuizRepository", "Error recording quiz attempt: ${e.message}")
            false
        }
    }
}