package com.example.myapplication.ui.Screens


import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.myapplication.ViewModels.AuthState
import com.example.myapplication.ViewModels.AuthViewModel

@Composable
fun StudentHomeScreen(
    modifier: Modifier = Modifier,
    navController: NavController,
    authViewModel: AuthViewModel
) {
    val authState = authViewModel.authState.observeAsState()

    LaunchedEffect(authState.value) {
        when(authState.value){
            is AuthState.Unauthenticated -> navController.navigate("login")
            else -> Unit
        }
    }

    Scaffold(
        topBar = {
            StudentTopAppBar(
                onLogoutClick = {
                    authViewModel.Logout()
                    navController.navigate("login")
                }
            )
        }
    ) { paddingValues ->
        StudentHomeContent(
            modifier = modifier.padding(paddingValues),
            navController = navController
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StudentTopAppBar(onLogoutClick: () -> Unit) {
    TopAppBar(
        title = { Text(text = "Student Dashboard") },
        actions = {
            TextButton(onClick = onLogoutClick) {
                Text(text = "Logout")
            }
        }
    )
}

@Composable
private fun StudentHomeContent(modifier: Modifier = Modifier, navController: NavController) {
    Column(
        modifier = modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Welcome, Student!", fontSize = 24.sp)

        Button(
            modifier = Modifier.padding(16.dp),
            onClick = {
                navController.navigate("join_quiz")
            }
        ) {
            Text(text = "Join a Quiz")
        }
    }
}