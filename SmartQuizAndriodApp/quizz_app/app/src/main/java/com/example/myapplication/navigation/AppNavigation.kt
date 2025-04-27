package com.example.myapplication.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.myapplication.ViewModels.AuthViewModel
import com.example.myapplication.ViewModels.QuizViewModel
import com.example.myapplication.ui.Screens.GenerateQuizz
import com.example.myapplication.ui.Screens.HomePage
import com.example.myapplication.ui.Screens.JoinQuizScreen
import com.example.myapplication.ui.Screens.LoginPage
import com.example.myapplication.ui.Screens.QuizListScreen
import com.example.myapplication.ui.Screens.QuizPreviewScreen
import com.example.myapplication.ui.Screens.SignupPage
import com.example.myapplication.ui.Screens.TakeQuizScreen
import com.example.myapplication.ui.Screens.QuizResultsScreen
import com.example.myapplication.ui.Screens.StudentHomeScreen

@Composable
fun AppNavigation(modifier: Modifier = Modifier, authViewModel: AuthViewModel, quizViewModel: QuizViewModel) {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "login"
    ) {
        composable(route = "login") {
            LoginPage(
                modifier = modifier,
                navController = navController,
                authViewModel = authViewModel
            )
        }

        composable(route = "signup") {
            SignupPage(
                modifier = modifier,
                navController = navController,
                authViewModel = authViewModel
            )
        }

        composable(route = "home") {
            HomePage(
                modifier = modifier,
                navController = navController,
                authViewModel = authViewModel
            )
        }

        // Add student home screen route
        composable(route = "student_home") {
            StudentHomeScreen(
                modifier = modifier,
                navController = navController,
                authViewModel = authViewModel
            )
        }

        composable(route = "generate_quizz") {
            GenerateQuizz(
                modifier = modifier,
                quizViewModel = quizViewModel,
                navController = navController
            )
        }

        composable(route = "quiz_list") {
            QuizListScreen(
                navController = navController,
                quizViewModel = quizViewModel
            )
        }

        // Quiz preview with ID parameter
        composable(
            route = "quiz_preview/{quizId}",
            arguments = listOf(navArgument("quizId") { type = NavType.StringType })
        ) { backStackEntry ->
            val quizId = backStackEntry.arguments?.getString("quizId") ?: ""
            QuizPreviewScreen(
                navController = navController,
                quizViewModel = quizViewModel,
                quizId = quizId
            )
        }

        // Default quiz preview without ID (if needed)
        composable(route = "quiz_preview") {
            QuizPreviewScreen(
                navController = navController,
                quizViewModel = quizViewModel
            )
        }

        composable(route = "join_quiz") {
            JoinQuizScreen(
                navController = navController,
                quizViewModel = quizViewModel
            )
        }

        // Take quiz screen with quiz ID
        composable(
            route = "take_quiz/{quizId}",
            arguments = listOf(navArgument("quizId") { type = NavType.StringType })
        ) { backStackEntry ->
            val quizId = backStackEntry.arguments?.getString("quizId") ?: ""
            TakeQuizScreen(
                navController = navController,
                quizViewModel = quizViewModel,
                quizId = quizId
            )
        }

        // Quiz results screen with quiz ID
        composable(
            route = "quiz_results/{quizId}",
            arguments = listOf(navArgument("quizId") { type = NavType.StringType })
        ) { backStackEntry ->
            val quizId = backStackEntry.arguments?.getString("quizId") ?: ""
            QuizResultsScreen(
                navController = navController,
                quizViewModel = quizViewModel,
                quizId = quizId
            )
        }
    }
}