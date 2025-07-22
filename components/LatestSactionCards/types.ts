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
    iconClass: [string, string] // FontAwesome icon class array [prefix, icon-name]
    colorClass: string
    label: string
  }
  
  export const reactions: Reaction[] = [
    { 
      name: 'like', 
      emoji: '👍', 
      iconClass: ['fas', 'thumbs-up'],
      colorClass: 'text-purple-600', 
      label: 'اعجاب' 
    },
    { 
      name: 'dislike', 
      emoji: '👎', 
      iconClass: ['fas', 'thumbs-down'],
      colorClass: 'text-gray-600', 
      label: 'عدم اعجاب' 
    },
    { 
      name: 'love', 
      emoji: '❤️', 
      iconClass: ['fas', 'heart'],
      colorClass: 'text-pink-600', 
      label: 'حُب' 
    },
    { 
      name: 'laugh', 
      emoji: '😂', 
      iconClass: ['fas', 'laugh'],
      colorClass: 'text-yellow-500', 
      label: 'ضحك' 
    },
    { 
      name: 'wow', 
      emoji: '😮', 
      iconClass: ['fas', 'surprise'],
      colorClass: 'text-orange-500', 
      label: 'Wow' 
    },
    { 
      name: 'sad', 
      emoji: '😢', 
      iconClass: ['fas', 'sad-tear'],
      colorClass: 'text-blue-400', 
      label: 'حزن' 
    },
    { 
      name: 'angry', 
      emoji: '😠', 
      iconClass: ['fas', 'angry'],
      colorClass: 'text-red-700', 
      label: 'غضب' 
    },
    { 
      name: 'fire', 
      emoji: '🔥', 
      iconClass: ['fas', 'fire'],
      colorClass: 'text-orange-500', 
      label: 'قوي' 
    },
    { 
      name: 'star', 
      emoji: '⭐', 
      iconClass: ['fas', 'star'],
      colorClass: 'text-yellow-400', 
      label: 'نجمة' 
    },
    { 
      name: 'tasty', 
      emoji: '😋', 
      iconClass: ['fas', 'grin-tongue'],
      colorClass: 'text-orange-400', 
      label: 'شهي' 
    }
  ]