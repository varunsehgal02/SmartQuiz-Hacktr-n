package com.example.myapplication.ViewModels


import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth

import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class AuthViewModel: ViewModel() {

    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState
    private val db = Firebase.firestore

    // Add user role state tracking
    private val _userRole = MutableStateFlow<String?>(null)
    val userRole: StateFlow<String?> = _userRole

    init {
        _authState.value = AuthState.Loading
        CheckStatus()
    }


    // Add this function to get the user's role
    fun getCurrentUserRole(callback: (String?) -> Unit) {
        val currentUser = auth.currentUser
        if (currentUser == null) {
            callback(null)
            return
        }

        db.collection("users").document(currentUser.uid).get()
            .addOnSuccessListener { document ->
                if (document != null && document.exists()) {
                    val role = document.getString("role")
                    _userRole.value = role
                    callback(role)
                } else {
                    callback(null)
                }
            }
            .addOnFailureListener {
                callback(null)
            }
    }

    // Modified Login function to get user role after login
    fun Login(email: String, password: String) {
        if (email.isEmpty() || password.isEmpty()) {
            _authState.value = AuthState.Error("Email and Password cannot be empty")
            return
        }

        _authState.value = AuthState.Loading
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    // After successful login, get the user role
                    getCurrentUserRole { role ->
                        if (role != null) {
                            _authState.value = AuthState.Authenticated(role)
                        } else {
                            _authState.value = AuthState.Authenticated("user") // Default role
                        }
                    }
                } else {
                    _authState.value = AuthState.Error(task.exception?.message ?: "Login failed")
                }
            }
    }

    // Modified Signup function to include role in authentication state
    fun Signup(email: String, password: String, name: String, role: String = "user") {
        if (email.isEmpty() || password.isEmpty()) {
            _authState.value = AuthState.Error("Email and Password cannot be empty")
            return
        }

        if (name.isEmpty()) {
            _authState.value = AuthState.Error("Name cannot be empty")
            return
        }

        _authState.value = AuthState.Loading
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    // Save user data to Firestore
                    val userId = auth.currentUser?.uid
                    if (userId != null) {
                        val userData = hashMapOf(
                            "email" to email,
                            "name" to name,
                            "role" to role,
                            "createdAt" to com.google.firebase.Timestamp.now()
                        )

                        db.collection("users").document(userId)
                            .set(userData)
                            .addOnSuccessListener {
                                _userRole.value = role
                                _authState.value = AuthState.Authenticated(role)
                            }
                            .addOnFailureListener { e ->
                                _authState.value = AuthState.Error("User created but failed to save profile: ${e.message}")
                            }
                    } else {
                        _authState.value = AuthState.Authenticated("user")
                    }
                } else {
                    _authState.value = AuthState.Error(task.exception?.message ?: "Signup failed")
                }
            }
    }

    // Modify method to check user status on app startup
    fun CheckStatus() {
        val user = auth.currentUser
        if (user != null) {
            getCurrentUserRole { role ->
                if (role != null) {
                    _authState.value = AuthState.Authenticated(role)
                } else {
                    _authState.value = AuthState.Authenticated("user")
                }
            }
        } else {
            _authState.value = AuthState.Unauthenticated
        }
    }


    fun Logout() {

        auth.signOut()
        _authState.value = AuthState.Unauthenticated
    }
}

sealed class AuthState {
    data class Authenticated(val role: String = "user"): AuthState()
    object Unauthenticated: AuthState()
    object Loading: AuthState()
    data class Error(val message: String): AuthState()
}