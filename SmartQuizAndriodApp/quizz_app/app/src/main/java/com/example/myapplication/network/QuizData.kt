package com.example.myapplication.network


import android.util.Log
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.annotations.SerializedName
import okhttp3.ResponseBody
import retrofit2.Converter
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.lang.reflect.Type

// Request model
data class QuizParams(
    @SerializedName("NLPprompt") val nlpPrompt: String,
    @SerializedName("num_questions") val numQuestions: Int,
    @SerializedName("Difficulty") val difficulty: String,
    @SerializedName("question_types") val questionTypes: List<String>,
    @SerializedName("progressive_bloom") val progressiveBloom: Boolean
)

data class Question(
    val type: String = "",
    val question: String? = null,
    val text: String? = null,
    val options: List<String>? = null,
    val correct_answer: Any? = null,
    val bloom_level: String? = null,
    val explanation: String? = null
) {
    // Keep your existing functions
    fun getQuestionText(): String {
        return question ?: text ?: "No question text available"
    }

    fun getCorrectAnswers(): List<String> {
        return when (correct_answer) {
            is String -> listOf(correct_answer as String)
            is List<*> -> (correct_answer as List<*>).mapNotNull { it?.toString() }
            else -> emptyList()
        }
    }
}


class RawResponseLoggingConverterFactory : Converter.Factory() {
    private val gson = createGson()
    private val delegateFactory = GsonConverterFactory.create(gson)

    override fun responseBodyConverter(
        type: Type,
        annotations: Array<out Annotation>,
        retrofit: Retrofit
    ): Converter<ResponseBody, *>? {
        val delegate = delegateFactory.responseBodyConverter(type, annotations, retrofit)

        return Converter<ResponseBody, Any> { body ->
            try {
                val rawJson = body.string()
                Log.d("API_RAW_RESPONSE", rawJson)

                // Create a new ResponseBody since we've consumed the original one
                val newBody = ResponseBody.create(body.contentType(), rawJson)
                delegate?.convert(newBody)
            } catch (e: Exception) {
                Log.e("API_PARSING_ERROR", "Failed to parse response: $e")
                throw e
            }
        }
    }

    private fun createGson(): Gson {
        return GsonBuilder().create()
    }
}
