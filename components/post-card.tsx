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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">{category}</span>
        <span className="text-gray-500 text-sm hidden sm:inline">•</span>
        <span className="text-gray-500 text-xs sm:text-sm">{timestamp}</span>
      </div>

      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{author}</h3>
          <p className="text-xs sm:text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>

      <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 leading-tight">{title}</h2>

      {image && (
        <div className="mb-3">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={600}
            height={300}
            className="w-full h-40 sm:h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{content}</p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 p-1 sm:p-2">
            <i className="fa fa-heart text-xs sm:text-sm mr-1"></i>
            <span className="text-xs sm:text-sm">{stats.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 p-1 sm:p-2">
            <i className="fa fa-comment text-xs sm:text-sm mr-1"></i>
            <span className="text-xs sm:text-sm">{stats.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 p-1 sm:p-2">
            <i className="fa fa-share text-xs sm:text-sm mr-1"></i>
            <span className="text-xs sm:text-sm">{stats.shares}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <i className="fa fa-eye text-xs sm:text-sm"></i>
            {stats.views}
          </span>
          <span className="flex items-center gap-1">
            <i className="fa fa-fingerprint text-xs sm:text-sm"></i>
            بصمة
          </span>
        </div>
      </div>
    </div>
  )
}