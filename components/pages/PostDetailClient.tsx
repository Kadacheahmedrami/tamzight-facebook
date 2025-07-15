"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Heart, 
  MessageCircle, 
  Share2,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Author {
  id: string
  email: string
  image?: string
}

interface PostCounts {
  comments: number
  likes: number
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: PostCounts
}

interface PostDetailClientProps {
  session: Session | null
  postId: string
}

export default function PostDetailClient({ session, postId }: PostDetailClientProps) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch post data on component mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/main/posts/${postId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('المنشور غير موجود')
            return
          }
          throw new Error('فشل في جلب بيانات المنشور')
        }
        
        const data = await response.json()
        setPost(data.post)
      } catch (error) {
        console.error('Error fetching post:', error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  // Check if current user is the author
  const isAuthor = session?.user?.email === post?.author?.email

  // Handle delete post
  const handleDeletePost = async () => {
    if (!post) return
    
    try {
      setDeleting(true)
      setError(null)
      
      const response = await fetch(`/api/main/posts/${post.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('فشل في حذف المنشور')
      }
      
      // Redirect to posts page after successful deletion
      router.push('/main/posts')
    } catch (error) {
      console.error('Error deleting post:', error)
      setError((error as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  // Handle edit post
  const handleEditPost = () => {
    if (!post) return
    router.push(`/main/posts/${post.id}/edit`)
  }

  // Handle share
  const handleShare = async () => {
    if (!post) return
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: window.location.href
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get display name for author
  const getAuthorDisplayName = (author: Author) => {
    return author.email.split('@')[0] // Use email username as display name
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => router.back()}
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-3" />
              <span className="text-gray-600">جاري تحميل المنشور...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          onClick={() => router.back()}
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'المنشور غير موجود'}
          </h2>
          <p className="text-gray-600 mb-4">قد يكون المنشور محذوفاً أو غير متاح</p>
          <Button 
            onClick={() => router.push('/main/posts')}
            variant="outline"
          >
            العودة إلى المنشورات
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <Button 
        onClick={() => router.back()}
        variant="ghost" 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        العودة
      </Button>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
              
              {/* Author and Date */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  {post.author.image && (
                    <img 
                      src={post.author.image} 
                      alt={getAuthorDisplayName(post.author)}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <User className="h-4 w-4" />
                  <span>{getAuthorDisplayName(post.author)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTimestamp(post.createdAt)}</span>
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                {post.subcategory && (
                  <Badge variant="outline">{post.subcategory}</Badge>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  مشاركة
                </DropdownMenuItem>
                {isAuthor && (
                  <>
                    <DropdownMenuItem onClick={handleEditPost}>
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeletePost}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting}
                          >
                            {deleting ? "جاري الحذف..." : "حذف"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          {/* Post Content */}
          <div className="prose prose-gray max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Media */}
          {post.image && (
            <div className="mb-6">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full rounded-lg shadow-sm"
              />
            </div>
          )}

          <Separator className="my-6" />

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{post._count.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post._count.comments}</span>
              </div>
            </div>
            
            {post.updatedAt !== post.createdAt && (
              <div className="text-xs text-gray-500">
                آخر تحديث: {formatTimestamp(post.updatedAt)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}