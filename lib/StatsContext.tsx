"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react"

// Define the shape of your stats (matches API response)
export interface StatsResponse {
  posts: number
  truth: number
  questions: number
  books: number
  videos: number
  images: number
  ads: number
  shop: number
  ideas: number
  support: number
}

// Default stats
const defaultStats: StatsResponse = {
  posts: 0,
  truth: 0,
  questions: 0,
  books: 0,
  videos: 0,
  images: 0,
  ads: 0,
  shop: 0,
  ideas: 0,
  support: 0,
}

// Context type
interface StatsContextType {
  stats: StatsResponse
  loading: boolean
  error: string | null
}

// Create context with defaults
const StatsContext = createContext<StatsContextType>({
  stats: defaultStats,
  loading: true,
  error: null,
})

// Provider
export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsResponse>(defaultStats)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Prevent double-fetch in StrictMode
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    fetch("/api/main/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
        return res.json()
      })
      .then((data: StatsResponse) => {
        setStats(data)
      })
      .catch((err) => {
        console.error("Stats fetch error:", err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <StatsContext.Provider value={{ stats, loading, error }}>
      {children}
    </StatsContext.Provider>
  )
}

// Hook
export function useStats() {
  const context = useContext(StatsContext)
  if (!context) throw new Error("useStats must be used within a StatsProvider")
  return context
}
