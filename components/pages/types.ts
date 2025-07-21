import { Session } from "next-auth"

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
// Define the reaction types based on your API response
export interface ReactionUser {
  userId: string
  userName: string
  userAvatar?: string
  createdAt: Date
}

export interface ReactionSummary {
  emoji: string
  count: number
  users: ReactionUser[]
}

export interface ReactionsData {
  total: number
  summary: ReactionSummary[]
  details: Record<string, ReactionUser[]>
}

export interface Post {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  image?: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  // User interaction fields
  userHasLiked: boolean
  userReaction: string | null
  // Updated reactions field to match API response
  reactions: ReactionsData
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalPosts: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
}

export interface PostsPageClientProps {
  session: Session | null
  searchParams: { 
    category?: string
    page?: string
  }
}

// Extended session type for PostCard compatibility
export interface ExtendedSession {
  user?: {
    id?: string
    email?: string
    name?: string
  }
}