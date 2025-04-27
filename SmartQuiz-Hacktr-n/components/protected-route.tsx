"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { db } from "@/firebase-config"
import { doc, getDoc } from "firebase/firestore"

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: "teacher" | "student" | "any"
}

export function ProtectedRoute({ children, role = "any" }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    async function checkUserRole() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || null)
          }
        } catch (error) {
          console.error("Error checking user role:", error)
        } finally {
          setCheckingRole(false)
        }
      } else {
        if (!loading) {
          setCheckingRole(false)
        }
      }
    }

    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/login")
      return
    }

    // Check user role if a specific role is required
    if (role !== "any" && user) {
      checkUserRole()
    } else {
      setCheckingRole(false)
    }
  }, [loading, user, router, role])

  if (loading || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // Role-specific authorization
  if (role !== "any" && userRole !== role) {
    // Redirect the user to appropriate dashboard based on their role
    if (userRole === "teacher") {
      router.push("/teacher/dashboard")
      return null
    } else if (userRole === "student") {
      router.push("/student/dashboard")
      return null
    }
    // If no role found, redirect to home
    router.push("/")
    return null
  }

  // If user is authenticated and has correct role, render children
  if (user) {
    return <>{children}</>
  }

  // Don't render anything while redirecting
  return null
} 