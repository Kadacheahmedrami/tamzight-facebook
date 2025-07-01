import { Heart, MessageCircle, Share2, Eye, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface PostCardProps {
  title: string
  content: string
  author: string
  timestamp: string
  category: string
  image?: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

export default function PostCard({ title, content, author, timestamp, category, image, stats }: PostCardProps) {
  return (
    <div className="post-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category}</span>
        <span className="text-gray-500 text-sm">•</span>
        <span className="text-gray-500 text-sm">{timestamp}</span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div>
          <h3 className="font-semibold text-gray-900">{author}</h3>
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2 text-gray-900">{title}</h2>

      {image && (
        <div className="mb-3">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={600}
            height={300}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <p className="text-gray-700 mb-4 leading-relaxed">{content}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
            <Heart className="h-4 w-4 ml-1" />
            {stats.likes}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
            <MessageCircle className="h-4 w-4 ml-1" />
            {stats.comments}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
            <Share2 className="h-4 w-4 ml-1" />
            {stats.shares}
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {stats.views}
          </span>
          <span className="flex items-center gap-1">
            <Fingerprint className="h-4 w-4" />
            بصمة
          </span>
        </div>
      </div>
    </div>
  )
}
