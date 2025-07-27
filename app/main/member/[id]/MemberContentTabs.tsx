"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import PostCard from "@/components/LatestSactionCards/post-card"
import { MapPin, Heart, MessageSquare } from "lucide-react"
import { Session } from "next-auth"


interface MemberData {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  _count: { posts: number; friendships: number; friendOf: number; likes: number; books: number; ideas: number }
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  isOwnProfile: boolean
}

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  alt?: string
  duration?: string
  resolution?: string
}

interface User {
  id: number
  firstName: string
  lastName: string
  avatar?: string | null
}

interface ContentItem {
  id: string
  title: string
  content: string
  description?: string | null
  timestamp?: string
  createdAt?: string
  category: string
  subcategory?: string | null
  image?: string
  type?: string
  _count: { likes: number; comments: number; shares: number }
  views: number
  shareId?: string
  sharedAt?: string
  isShared?: boolean
  author?: { 
    id?: number
    firstName: string
    lastName: string
    avatar?: string 
  }
  authorId?: number
  authorData?: User
  images?: string[]
  media?: MediaItem[]
  reactions?: any[]
  price?: number
  currency?: string
  inStock?: boolean
  sizes?: string[]
  colors?: string[]
  userHasLiked?: boolean
  userReaction?: string | null
  reactionDetails?: { 
    total: number
    summary: Array<{ emoji: string; count: number; users: any[] }>
    details: Record<string, any[]> 
  }
}

interface InteractionItem {
  id: string
  type: 'like' | 'comment'
  timestamp: string
  content?: string
  targetContent?: { id: string; title: string; author: { firstName: string; lastName: string } }
}

interface FriendItem {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  location?: string
  occupation?: string
  friendsSince: string
}


interface MemberContentTabsProps {
  memberData: MemberData
  memberId: string
  session: Session | null
}

const LIMIT = 20

// Helper function to get the proper base route for different content types
const getBaseRoute = (type: string): string => {
  const typeRoutes: { [key: string]: string } = {
    'post': '/main/posts',
    'book': '/main/books',
    'idea': '/main/ideas',
    'image': '/main/images',
    'video': '/main/videos',
    'truth': '/main/truths',
    'question': '/main/questions',
    'ad': '/main/ads',
    'product': '/main/products',
    'share': '/main/shares'
  }
  
  return typeRoutes[type] || '/main/posts'
}

// Helper function to get the proper API endpoint
const getApiEndpoint = (contentType: string, memberId: string): string => {
  if (contentType === 'interactions' || contentType === 'friends') {
    return `/api/main/member/${memberId}/content?type=${contentType}`
  }
  
  const params = new URLSearchParams({
    limit: LIMIT.toString(),
    authorId: memberId
  })
  
  if (contentType !== 'posts' && contentType !== 'all') {
    params.append('type', contentType.slice(0, -1)) // Remove 's' from plural
  }
  
  return `/api/main/latest?${params}`
}

export default function MemberContentTabs({ memberData, memberId, session }: MemberContentTabsProps) {
  const [activeTab, setActiveTab] = useState("posts")
  const [contentData, setContentData] = useState<ContentItem[]>([])
  const [interactionData, setInteractionData] = useState<InteractionItem[]>([])
  const [friendsData, setFriendsData] = useState<FriendItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentOffset, setCurrentOffset] = useState(0)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  // Check if user is authenticated
  const isAuthenticated = Boolean(session?.user?.id)
  const currentUserId = session?.user?.id

  const formatTimestamp = useCallback((timestamp?: string, createdAt?: string) => {
    const date = timestamp || createdAt
    if (!date) return 'الآن'
    
    try {
      const diffInHours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInHours / 24)
      
      if (diffInHours < 1) return 'الآن'
      if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
      if (diffInDays < 7) return `منذ ${diffInDays} يوم`
      
      return new Date(date).toLocaleDateString('ar-SA', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      })
    } catch {
      return 'الآن'
    }
  }, [])

  const transformContentItem = useCallback((item: any): ContentItem => {
    const media: MediaItem[] = []
    
    if (item.image) {
      media.push({ id: `img-${item.id}`, type: 'image', url: item.image, alt: item.title || 'صورة' })
    }
    
    if (item.images?.length) {
      item.images.forEach((url: string, i: number) => {
        media.push({ id: `img-${item.id}-${i}`, type: 'image', url, alt: item.title || 'صورة' })
      })
    }

    return {
      id: item.id?.toString() || Math.random().toString(36).substr(2, 9),
      title: item.title || 'بدون عنوان',
      content: item.content || item.description || '',
      description: item.description || null,
      timestamp: item.timestamp,
      createdAt: item.createdAt,
      category: item.category || 'عام',
      subcategory: item.subcategory,
      type: item.type,
      image: item.image,
      images: item.images,
      media,
      views: item.views || 0,
      shareId: item.shareId,
      sharedAt: item.sharedAt,
      isShared: item.isShared,
      author: item.author,
      authorId: item.authorId || item.author?.id,
      authorData: item.author || { 
        id: parseInt(item.authorId) || parseInt(memberId, 10), 
        firstName: memberData.firstName, 
        lastName: memberData.lastName,
        avatar: memberData.avatar
      },
      reactions: item.reactions || [],
      _count: item._count || {
        likes: item.likes?.length || 0,
        comments: item.comments?.length || 0,
        shares: item.shares?.length || 0
      },
      price: item.price,
      currency: item.currency,
      inStock: item.inStock,
      sizes: item.sizes,
      colors: item.colors,
      userHasLiked: item.userHasLiked || false,
      userReaction: item.userReaction,
      reactionDetails: item.reactionDetails
    }
  }, [memberId, memberData])

  const fetchContentData = useCallback(async (contentType: string, offset = 0, isLoadMore = false) => {
    if (isLoadingRef.current || !isMountedRef.current) return

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    isLoadingRef.current = true

    isLoadMore ? setLoadingMore(true) : setLoading(true)
    setError(null)

    try {
      let url: string
      
      if (contentType === 'interactions' || contentType === 'friends') {
        url = getApiEndpoint(contentType, memberId)
      } else {
        const params = new URLSearchParams({ 
          limit: LIMIT.toString(), 
          offset: offset.toString(),
          authorId: memberId
        })
        
        if (contentType !== 'posts' && contentType !== 'all') {
          params.append('type', contentType.slice(0, -1)) // Remove 's' from plural
        }
        
        url = `/api/main/latest?${params}`
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Include authentication headers if session exists
      if (session?.user?.id) {
        headers['Authorization'] = `Bearer ${session.user.id}`
      }

      const response = await fetch(url, { 
        signal: abortController.signal,
        headers
      })
      
      if (!isMountedRef.current || abortController.signal.aborted) return
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      let data: any = await response.json()
      
      // Handle special endpoints that might return different formats
      if (contentType === 'interactions' || contentType === 'friends') {
        data = {
          success: true,
          data: Array.isArray(data) ? data : [],
          meta: { hasMore: false, total: Array.isArray(data) ? data.length : 0 }
        }
      }
      
      if (!isMountedRef.current || abortController.signal.aborted) return
      
      if (contentType === 'interactions') {
        const interactions = Array.isArray(data.data) ? data.data : []
        isLoadMore ? setInteractionData(prev => [...prev, ...interactions]) : setInteractionData(interactions)
        setHasMore(false)
      } else if (contentType === 'friends') {
        const friends = Array.isArray(data.data) ? data.data : []
        isLoadMore ? setFriendsData(prev => [...prev, ...friends]) : setFriendsData(friends)
        setHasMore(false)
      } else {
        if (!data.success || !Array.isArray(data.data)) throw new Error(data.error || 'صيغة استجابة غير صالحة')

        const transformedContent = data.data.map(transformContentItem)
        
        if (isLoadMore) {
          setContentData((prev: ContentItem[]) => {
            const existingIds = new Set(prev.map((p: ContentItem) => p.id))
            const newContent = transformedContent.filter((p: ContentItem) => !existingIds.has(p.id))
            return [...prev, ...newContent]
          })
          setCurrentOffset(offset + transformedContent.length)
        } else {
          setContentData(transformedContent)
          setCurrentOffset(transformedContent.length)
        }
        
        
        setHasMore(data.meta?.hasMore !== false && transformedContent.length === LIMIT)
      }
      
    } catch (error) {
      if (!isMountedRef.current || (error instanceof Error && error.name === 'AbortError')) return
      
      const errorMessage = error instanceof Error ? error.message : 'خطأ في تحميل البيانات'
      setError(errorMessage)
      
      if (!isLoadMore) {
        contentType === 'interactions' ? setInteractionData([]) : 
        contentType === 'friends' ? setFriendsData([]) : setContentData([])
      }
      setHasMore(false)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        setLoadingMore(false)
      }
      isLoadingRef.current = false
      if (abortControllerRef.current === abortController) abortControllerRef.current = null
    }
  }, [memberId, transformContentItem, session])

  const loadMore = useCallback(() => {
    if (!loadingMore && !isLoadingRef.current && hasMore && contentData.length > 0 && isMountedRef.current) {
      fetchContentData(activeTab, currentOffset, true)
    }
  }, [loadingMore, hasMore, contentData.length, activeTab, fetchContentData, currentOffset])

  useEffect(() => {
    if (!isMountedRef.current) return
    
    observerRef.current?.disconnect()
    if (!hasMore || loadingMore || isLoadingRef.current || activeTab === 'interactions' || activeTab === 'friends') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current && hasMore && contentData.length > 0 && isMountedRef.current) {
          loadMore()
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    observerRef.current = observer
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore, contentData.length, activeTab])

  useEffect(() => {
    if (isMountedRef.current) {
      setHasMore(true)
      setCurrentOffset(0)
      setContentData([])
      setInteractionData([])
      setFriendsData([])
      fetchContentData(activeTab, 0, false)
    }
  }, [activeTab, memberId, fetchContentData])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      observerRef.current?.disconnect()
    }
  }, [])

  const fullName = `${memberData.firstName} ${memberData.lastName}`
  const totalFriends = memberData._count.friendships + memberData._count.friendOf
  
  const createAuthorData = (item?: ContentItem) => {
    if (item?.isShared && item.author) {
      return {
        id: item.author.id || parseInt(memberId, 10),
        firstName: item.author.firstName,
        lastName: item.author.lastName,
        avatar: item.author.avatar
      }
    }
    
    return {
      id: parseInt(memberData.id, 10),
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      avatar: memberData.avatar
    }
  }

  const handlePostDelete = (postId: string) => setContentData(prev => prev.filter(item => item.id !== postId))
  const handlePostUpdate = (postId: string, updatedData: any) => 
    setContentData(prev => prev.map(item => item.id === postId ? { ...item, ...updatedData } : item))

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
          <div className="flex justify-start items-center mb-4 gap-3">
            <div className="h-4 bg-gray-200 rounded-full w-20"></div>
            <div className="bg-gray-200 rounded-full h-2 w-2"></div>
            <div className="h-4 bg-gray-200 rounded-full w-16"></div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-60 bg-gray-200 rounded mb-3"></div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-3 bg-gray-200 rounded w-12"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const EmptyState = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )

  const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="text-center py-8">
      <div className="bg-red-50 rounded-lg p-8">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-2">خطأ في تحميل البيانات</p>
        <p className="text-red-500 text-sm mb-4">{message}</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  )

  const Avatar = ({ src, alt, fallback }: { src?: string; alt: string; fallback: string }) => (
    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-600 font-medium text-sm">{fallback}</span>
      )}
    </div>
  )

  const renderContent = () => {
    if (loading && (contentData.length === 0 && interactionData.length === 0 && friendsData.length === 0)) {
      return <LoadingSkeleton />
    }
    
    if (activeTab === 'interactions') {
      if (error && interactionData.length === 0) {
        return <ErrorState message={error} onRetry={() => fetchContentData(activeTab, 0, false)} />
      }
      
      return interactionData.length === 0 ? (
        <EmptyState icon="❤️" title="تفاعلات العضو" description="لا توجد تفاعلات حديثة" />
      ) : (
        <div className="space-y-4">
          {interactionData.map((interaction) => (
            <div key={interaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  interaction.type === 'like' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {interaction.type === 'like' ? 
                    <Heart className="w-4 h-4 text-red-600" /> : 
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    {interaction.type === 'like' ? 
                      `أعجب بـ "${interaction.targetContent?.title}"` : 
                      `علق على "${interaction.targetContent?.title}"`
                    }
                  </div>
                  {interaction.content && <div className="text-gray-800 mb-2">{interaction.content}</div>}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTimestamp(interaction.timestamp)}</span>
                    {interaction.targetContent?.author && (
                      <>
                        <span>•</span>
                        <span>بواسطة {interaction.targetContent.author.firstName} {interaction.targetContent.author.lastName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'friends') {
      if (error && friendsData.length === 0) {
        return <ErrorState message={error} onRetry={() => fetchContentData(activeTab, 0, false)} />
      }
      
      return friendsData.length === 0 ? (
        <EmptyState icon="👥" title="أصدقاء العضو" 
                   description={memberData.isOwnProfile ? "قائمة أصدقائك فارغة" : "قائمة الأصدقاء"} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendsData.map((friend) => (
            <div key={friend.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={friend.avatar} 
                  alt={`${friend.firstName} ${friend.lastName}`}
                  fallback={`${friend.firstName[0]}${friend.lastName[0]}`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{friend.firstName} {friend.lastName}</h3>
                  {friend.occupation && <p className="text-sm text-gray-600">{friend.occupation}</p>}
                  {friend.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{friend.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">أصدقاء منذ {formatTimestamp(friend.friendsSince)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (error && contentData.length === 0) {
      return <ErrorState message={error} onRetry={() => fetchContentData(activeTab, 0, false)} />
    }
    
    if (contentData.length === 0) {
      const contentNames: { [key: string]: string } = {
        posts: 'المنشورات', books: 'الكتب', ideas: 'الأفكار', images: 'الصور', videos: 'الفيديوهات',
        truths: 'الحقائق', questions: 'الأسئلة', ads: 'الإعلانات', products: 'المنتجات', shares: 'المشاركات'
      }
      const icons: { [key: string]: string } = {
        posts: '📝', books: '📚', ideas: '💡', images: '🖼️', videos: '🎥',
        truths: '✨', questions: '❓', ads: '📢', products: '🛍️', shares: '📤'
      }
      
      return (
        <EmptyState 
          icon={icons[activeTab] || '📄'}
          title={`${contentNames[activeTab] || 'المحتوى'} العضو`}
          description={memberData.isOwnProfile 
            ? `لم تنشر أي ${contentNames[activeTab] || 'محتوى'} بعد` 
            : `لم ينشر هذا العضو أي ${contentNames[activeTab] || 'محتوى'} بعد`
          }
        />
      )
    }

    return (
      <div className="space-y-4 lg:space-y-6">
        {contentData.map((item, index) => {
          const authorData = createAuthorData(item)
          const displayAuthor = item.isShared && item.author 
            ? `${item.author.firstName} ${item.author.lastName}` 
            : fullName

          // Determine the correct content type for the base route
          const contentType = item.type || activeTab.slice(0, -1) // Remove 's' from plural
          const baseRoute = getBaseRoute(contentType)

          return (
            <PostCard 
              key={`${item.id}-${index}`}
              id={item.id} 
              title={item.title || ''} 
              content={item.content || ''}
              author={displayAuthor}
              authorId={authorData.id}
              authorData={authorData}
              timestamp={formatTimestamp(item.timestamp, item.createdAt)}
              category={item.category || ''} 
              type={contentType}
              image={item.image}
              images={item.images || []}
              media={item.media || []}
              subcategory={item.subcategory}
              baseRoute={baseRoute}
              stats={{ 
                views: item.views || 0, 
                likes: item._count?.likes || 0, 
                comments: item._count?.comments || 0, 
                shares: item._count?.shares || 0 
              }}
              session={session}
              userHasLiked={item.userHasLiked || false}
              userReaction={item.userReaction}
              reactionDetails={item.reactionDetails}
              price={item.price}
              currency={item.currency}
              inStock={item.inStock}
              sizes={item.sizes}
              onDelete={handlePostDelete}
              onUpdate={handlePostUpdate}
            />
          )
        })}
        
        {hasMore && activeTab !== 'interactions' && activeTab !== 'friends' && (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm">تحميل المزيد...</span>
              </div>
            )}
          </div>
        )}
        
        {!hasMore && contentData.length > 0 && (
          <div className="text-center py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-400 text-2xl mb-2">🎉</div>
              <p className="text-gray-600 text-sm">تم عرض جميع المنشورات</p>
              <p className="text-gray-500 text-xs mt-1">المجموع: {contentData.length} منشور</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { value: 'posts', label: `المنشورات (${memberData._count.posts})` },
    { value: 'shares', label: 'المشاركات' },
    { value: 'interactions', label: 'التفاعلات' },
    { value: 'books', label: 'الكتب' },
    { value: 'ideas', label: 'الأفكار' },
    { value: 'images', label: 'الصور' },
    { value: 'videos', label: 'الفيديوهات' },
    { value: 'truths', label: 'الحقائق' },
    { value: 'questions', label: 'الأسئلة' },
    { value: 'ads', label: 'الإعلانات' },
    { value: 'products', label: 'المنتجات' },
    ...(memberData.isOwnProfile || memberData.friendshipStatus === 'friends' ? 
       [{ value: 'friends', label: `الأصدقاء (${totalFriends})` }] : [])
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="w-full">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 px-1">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2 font-medium rounded-md transition-colors flex-shrink-0 min-w-fit ${
                  activeTab === tab.value
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 lg:mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}