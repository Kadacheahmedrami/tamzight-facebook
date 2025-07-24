export interface ExtendedSession {
  user?: {
    id?: string
    email?: string
    name?: string
  }
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalPosts: number
  hasNextPage: boolean
  hasPrevPage: boolean
  // Additional properties for different content types
  totalIdeas?: number
  totalVideos?: number
  totalBooks?: number
  totalImages?: number
  totalQuestions?: number
  totalProducts?: number
  totalAds?: number
  totalTruth?: number
}

export interface ReactionUser {
  userId: string
  userName: string
  avatar?: string
  createdAt: Date 
}

export interface ReactionsData {
  total: number
  summary: Array<{ emoji: string; count: number; users: ReactionUser[]  }>
  details: Record<string, ReactionUser[]>
}

export interface Post {
  id: string
  title: string
  content: string
  description?: string // For images
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
  userHasLiked?: boolean
  userReaction?: string | null
  reactions?: ReactionsData
  
  // Video-specific properties
  duration?: string
  quality?: string
  language?: string
  
  // Book-specific properties
  pages?: number
  isbn?: string
  
  // Idea-specific properties
  status?: string
  priority?: string
  votes?: number
  
  // Image-specific properties
  location?: string
  resolution?: string
  tags?: string[]
  
  // Question-specific properties
  type?: string
  answered?: boolean
  
  // Product-specific properties
  price?: string
  currency?: string
  inStock?: boolean
  sizes?: string[]
  colors?: string[]
  
  // Ad-specific properties
  targetAmount?: string
  currentAmount?: string
  deadline?: string
}

export interface PostsPageClientProps {
  session: any
  searchParams: {
    category?: string
    page?: string
  }
}
