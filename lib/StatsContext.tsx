"use client"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

// Define the shape of your stats
export interface StatsResponse {
  totalPosts: number
  todayPosts: number
  trendingPosts: number
  totalUsers: number
  activeUsers: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  sections: Record<string, number>
}

// Default empty stats so UI stays stable
const defaultStats: StatsResponse = {
  totalPosts: 0,
  todayPosts: 0,
  trendingPosts: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
  sections: {
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
  },
}

// Extended context type
interface StatsContextType {
  stats: StatsResponse
  loading: boolean
  error: string | null
}

// Create context with defaultStats
const StatsContext = createContext<StatsContextType>({
  stats: defaultStats,
  loading: true,
  error: null,
})

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsResponse>(defaultStats)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/main/stats")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch: ${r.status}`)
        return r.json()
      })
      .then((data: StatsResponse) => {
        setStats(data)
      })
      .catch((err) => {
        console.error(err)
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

export function useStats() {
  const context = useContext(StatsContext)
  if (!context) throw new Error("useStats must be used within a StatsProvider")
  return context
}
