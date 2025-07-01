"use client"

import { useState, useEffect } from "react"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Include cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, remember = false) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify({ email, password, remember }),
    })

    const data = await response.json()

    if (data.success) {
      setUser(data.user)
    }

    return data
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (data.success) {
      setUser(data.user)
    }

    return data
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  }
}
