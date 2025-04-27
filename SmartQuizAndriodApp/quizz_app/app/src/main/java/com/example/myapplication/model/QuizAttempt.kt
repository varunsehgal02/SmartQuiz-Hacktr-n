package com.example.myapplication.model


data class QuizAttempt(
    val studentEmail: String = "",
    val studentName: String = "",
    val timestamp: Long = 0,
    val score: Int = 0,
    val totalQuestions: Int = 0
)