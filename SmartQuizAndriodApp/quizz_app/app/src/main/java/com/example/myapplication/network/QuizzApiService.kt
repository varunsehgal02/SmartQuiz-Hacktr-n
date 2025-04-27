package com.example.myapplication.network

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit


interface NLPApiService {
    @POST("/generate-quiz")
    suspend fun generateQuiz(@Body quizParams: QuizParams): Response<List<Question>>

    companion object {
        private const val BASE_URL = "https://af80-2401-4900-36a0-5191-d127-6b1-c9bf-f03f.ngrok-free.app"

        fun create(): NLPApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(120, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build()

            // Create Gson with custom type adapter for handling mixed types
            val gson = GsonBuilder()
                .setLenient()
                .create()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(RawResponseLoggingConverterFactory())
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
                .create(NLPApiService::class.java)
        }
    }
}