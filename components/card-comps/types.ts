export interface MediaItem {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnail?: string // For videos
    alt?: string
    duration?: string // For videos
    resolution?: string
  }
  
  export interface PostCardProps {
    id: string
    title: string
    content: string
    author: string
    authorId: string
    timestamp: string
    category: string
    subCategory?: string
    media?: MediaItem[] // Support multiple media items
    image?: string // Single image for regular posts
    images?: string[] // Multiple images for regular posts
    baseRoute?: string
    stats: {
      views: number
      likes: number
      comments: number
      shares: number
    }
  }
  
  export interface Reaction {
    name: string
    emoji: string
    color: string
    label: string
  }
  
  export const reactions: Reaction[] = [
    { name: 'like', emoji: '👍', color: 'text-blue-600', label: 'Like' },
    { name: 'love', emoji: '❤️', color: 'text-red-500', label: 'Love' },
    { name: 'laugh', emoji: '😂', color: 'text-yellow-500', label: 'Haha' },
    { name: 'wow', emoji: '😮', color: 'text-orange-500', label: 'Wow' },
    { name: 'sad', emoji: '😢', color: 'text-blue-400', label: 'Sad' },
    { name: 'angry', emoji: '😠', color: 'text-red-600', label: 'Angry' }
  ]