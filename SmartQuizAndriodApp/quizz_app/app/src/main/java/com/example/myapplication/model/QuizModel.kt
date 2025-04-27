package com.example.myapplication.model

import com.example.myapplication.network.Question

data class Quiz(
    var id: String = "",
    val title: String = "",
    val description: String = "",
    val questions: List<Question> = emptyList(),
    val adminAccess: List<String> = emptyList(),
    val createdAt: Long = 0,
    val updatedAt: Long = 0,
    val isPublic: Boolean = false,
    val publicUntil: Long = 0,
    val lastActivatedAt: Long = 0,
    val studentAttempts: List<QuizAttempt> = emptyList()
)

