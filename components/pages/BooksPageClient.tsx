"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import BookCard from "@/components/Cards/BookCard"
import type { ExtendedSession, PaginationInfo, Post, PostsPageClientProps } from "./types"
import { BookUploadModal } from "@/components/UploadModals/BookUploadModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"

export default function BooksPageClient({ session, searchParams }: PostsPageClientProps) {
  const router = useRouter()

  // State management
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const POSTS_PER_PAGE = 10

  // Refs for intersection observer and request management
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Categories configuration for books
  const categories = useMemo(
    () => [
      { value: "all", label: "الجميع" },
      { value: "fiction", label: "روايات" },
      { value: "non-fiction", label: "غير روائية" },
      { value: "educational", label: "تعليمية" },
      { value: "religious", label: "دينية" },
      { value: "history", label: "تاريخية" },
      { value: "science", label: "علمية" },
      { value: "poetry", label: "شعر" },
    ],
    [],
  )

  // Initialize state from URL params
  useEffect(() => {
    if (!initialized) {
      setSelectedCategory(searchParams.category || "all")
      setCurrentPage(Number.parseInt(searchParams.page || "1"))
      setInitialized(true)
    }
  }, [searchParams, initialized])

  // Convert session to compatible format
  const extendedSession: ExtendedSession | null = useMemo(() => {
    if (!session) return null

    return {
      user: {
        id: (session.user as { id?: string })?.id || undefined,
        email: session.user?.email || undefined,
        name: session.user?.name || undefined,
      },
    }
  }, [session])

  // Loading skeleton component
 const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="overflow-hidden bg-white border-0 shadow-md rounded-lg animate-pulse">
        {/* Card Header */}
        <div className="pb-3 p-6">
          {/* Top Row: Image + Metadata */}
          <div className="flex gap-4">
            {/* Book Image Skeleton */}
            <div className="relative w-32 h-44 flex-shrink-0">
              <div className="w-full h-full bg-gray-200 rounded-lg"></div>
              {/* File Size Badge Skeleton */}
              <div className="absolute top-1 left-1 bg-gray-300 rounded-full w-8 h-4"></div>
              {/* Rating Badge Skeleton */}
              <div className="absolute top-1 right-1 bg-gray-300 rounded-full w-10 h-4"></div>
              {/* Downloads Badge Skeleton */}
              <div className="absolute bottom-1 left-1 bg-gray-300 rounded-full w-12 h-4"></div>
            </div>

            {/* Book Metadata Skeleton */}
            <div className="flex-1 min-w-0">
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <div className="bg-gray-200 rounded-full h-6 w-16"></div>
                <div className="bg-gray-200 rounded-full h-6 w-20"></div>
                <div className="bg-gray-200 rounded-full h-6 w-14"></div>
              </div>

              {/* Title */}
              <div className="mb-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>

              {/* Author and Timestamp */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>

              {/* Book Details Box */}
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="pt-0 space-y-4 p-6">
          {/* Content/Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
          </div>

          {/* Reactions Display */}
          <div className="flex justify-end">
            <div className="flex gap-1">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-8 ml-2 self-center"></div>
            </div>
          </div>

          {/* Interactions Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

  // Update URL with current filters
  const updateURL = useCallback(
    (category: string, page: number) => {
      const params = new URLSearchParams()

      if (category !== "all") params.set("category", category)
      if (page > 1) params.set("page", page.toString())

      const queryString = params.toString()
      const url = queryString ? `?${queryString}` : ""

      router.replace(`/main/books${url}`, { scroll: false })
    },
    [router],
  )

  // Fetch posts function
  const fetchPosts = useCallback(
    async (category = "all", page = 1, isLoadMore = false) => {
      if (isLoadingRef.current) {
        console.log("Request already in progress, skipping...")
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController
      isLoadingRef.current = true

      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: POSTS_PER_PAGE.toString(),
        })

        if (category !== "all") params.set("category", category)

        console.log(`Fetching books: category=${category}, page=${page}, isLoadMore=${isLoadMore}`)

        const response = await fetch(`/api/main/books?${params}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("API Response data:", data)

        const transformedPosts =
          data.books?.map((post: any) => ({
            id: post.id?.toString() || Math.random().toString(36).substr(2, 9),
            title: post.title || "عنوان غير محدد",
            content: post.content || "محتوى غير متوفر",
            author: post.author || "مستخدم غير معروف",
            authorId: post.authorId || "unknown",
            timestamp: post.timestamp || "غير محدد",
            category: post.category || "عام",
            subCategory: post.subcategory || undefined,
            image: post.image || undefined,
            pages: post.pages || undefined,
            language: post.language || undefined,
            isbn: post.isbn || undefined,
            stats: {
              views: post.stats?.views || 0,
              likes: post.stats?.likes || 0,
              comments: post.stats?.comments || 0,
              shares: post.stats?.shares || 0,
            },
            userHasLiked: post.userHasLiked || false,
            userReaction: post.userReaction || null,
            reactions: {
              total: post.reactions?.total || 0,
              summary: post.reactions?.summary || [],
              details: post.reactions?.details || {},
            },
          })) || []

        setPagination(data.pagination)

        if (isLoadMore) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newPosts = transformedPosts.filter((p: Post) => !existingIds.has(p.id))
            console.log(`Adding ${newPosts.length} new posts to existing ${prev.length} posts`)
            return [...prev, ...newPosts]
          })
        } else {
          setPosts(transformedPosts)
          console.log(`Replaced with ${transformedPosts.length} posts`)
        }

        if (!isLoadMore) {
          updateURL(category, page)
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was aborted")
          return
        }

        console.error("Error fetching books:", error)
        setError("فشل في تحميل الكتب. يرجى المحاولة مرة أخرى.")

        if (page === 1 && !isLoadMore) {
          setPosts([])
          setPagination(null)
        }
      } finally {
        setLoading(false)
        setLoadingMore(false)
        isLoadingRef.current = false

        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
        }
      }
    },
    [POSTS_PER_PAGE, updateURL],
  )

  // Load more posts when intersection observer triggers
  const loadMore = useCallback(() => {
    if (!loadingMore && !isLoadingRef.current && pagination?.hasNextPage && posts.length > 0) {
      const nextPage = currentPage + 1
      console.log(`Loading more books: page ${nextPage}`)
      setCurrentPage(nextPage)
      fetchPosts(selectedCategory, nextPage, true)
    }
  }, [loadingMore, pagination?.hasNextPage, posts.length, selectedCategory, currentPage, fetchPosts])

  // Set up intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!pagination?.hasNextPage || loadingMore || isLoadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingRef.current && pagination?.hasNextPage) {
          console.log("Intersection observer triggered")
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [pagination?.hasNextPage, loadingMore, loadMore])

  // Handle post deletion
  const handlePostDelete = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
    setPagination((prev) =>
      prev
        ? {
            ...prev,
            totalPosts: prev.totalPosts - 1,
          }
        : null,
    )
  }, [])

  // Handle post update
  const handlePostUpdate = useCallback((postId: string, updatedData: any) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...updatedData,
              reactions: updatedData.reactions
                ? {
                    ...post.reactions,
                    ...updatedData.reactions,
                  }
                : post.reactions,
            }
          : post,
      ),
    )
  }, [])

  // Handle new post creation
  const handleNewPost = useCallback(
    (newPost: any) => {
      const transformedPost = {
        id: newPost.id?.toString() || Math.random().toString(36).substr(2, 9),
        title: newPost.title || "عنوان غير محدد",
        content: newPost.content || "محتوى غير متوفر",
        author: session?.user?.name || session?.user?.email || "مستخدم غير معروف",
        authorId: (session?.user as { id?: string })?.id || "unknown",
        timestamp: new Date().toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: newPost.category || "عام",
        subCategory: newPost.subcategory || undefined,
        image: newPost.image || undefined,
        stats: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        },
        userHasLiked: false,
        userReaction: null,
        reactions: {
          total: 0,
          summary: [],
          details: {},
        },
      }

      setPosts((prev) => [transformedPost, ...prev])
      setPagination((prev) =>
        prev
          ? {
              ...prev,
              totalPosts: prev.totalPosts + 1,
            }
          : null,
      )
    },
    [session],
  )

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: string) => {
      console.log(`Changing category to: ${category}`)
      setSelectedCategory(category)
      setCurrentPage(1)
      setPosts([])
      setPagination(null)
      setError(null)
      fetchPosts(category, 1, false)
    },
    [fetchPosts],
  )

  // Handle refresh
  const handleRefresh = useCallback(() => {
    console.log("Refreshing books")
    setCurrentPage(1)
    setPosts([])
    setPagination(null)
    setError(null)
    fetchPosts(selectedCategory, 1, false)
  }, [selectedCategory, fetchPosts])

  // Handle post upload success
  const handlePostUploadSuccess = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  // Initial data fetch
  useEffect(() => {
    if (initialized) {
      fetchPosts(selectedCategory, currentPage, false)
    }
  }, [initialized])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Get current category label
  const getCurrentCategoryLabel = () => {
    return categories.find((cat) => cat.value === selectedCategory)?.label || "الجميع"
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-xl md:text-2xl text-gray-600">
          <span>مكتبة الكتب</span>
        </div>
      </nav>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض اخر كتب:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم لعرضه" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleRefresh}
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "جاري التحميل..." : "اعرض"}
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      {pagination && (
        <div className="mb-4 text-sm text-gray-600">
          <span>
            عرض {posts.length} من أصل {pagination.totalPosts || pagination.totalBooks || 0} كتاب
            {selectedCategory !== "all" && <span className="mr-2">• القسم: {getCurrentCategoryLabel()}</span>}
          </span>
        </div>
      )}

      {/* Create Post Dialog Trigger */}
      {session && (
        <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
          <DialogTrigger asChild>
            <div className="border rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                <Input
                  placeholder="شارك كتاب جديد مع المجتمع"
                  className="flex-1 cursor-pointer text-sm sm:text-base"
                  readOnly
                />
              </div>
            </div>
          </DialogTrigger>

          <BookUploadModal
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            onSuccess={handlePostUploadSuccess}
          />
        </Dialog>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <Button size="sm" onClick={handleRefresh} className="mt-2 bg-transparent" variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && posts.length === 0 && <LoadingSkeleton />}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <BookCard
                key={`${post.id}-${index}`}
                id={post.id}
                title={post.title}
                content={post.content}
                author={post.author}
                authorId={post.authorId}
                timestamp={post.timestamp}
                category={post.category}
                subCategory={post.subCategory}
                image={post.image}
                pages={post.pages}
                language={post.language}
                isbn={post.isbn}
                stats={post.stats}
                session={extendedSession}
                onDelete={handlePostDelete}
                onUpdate={handlePostUpdate}
                userHasLiked={post.userHasLiked}
                userReaction={post.userReaction}
                reactions={post.reactions}
                apiEndpoint={"books"}
                detailsRoute={"/main/books"}
              />
            ))}

            {/* Infinite scroll trigger */}
            {pagination?.hasNextPage && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm">جاري تحميل المزيد...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of Posts Indicator */}
            {pagination && !pagination.hasNextPage && posts.length > 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-gray-400 text-4xl mb-2">📚</div>
                  <p className="text-gray-600 text-sm">تم عرض جميع الكتب</p>
                  {(pagination.totalPosts || pagination.totalBooks) && (
                    <p className="text-gray-500 text-xs mt-1">
                      إجمالي {pagination.totalPosts || pagination.totalBooks} كتاب
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Load more error */}
            {error && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل المزيد من الكتب</p>
                <Button onClick={loadMore} variant="outline">
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-8">
                <div className="text-gray-400 text-6xl mb-4">📖</div>
                <p className="text-gray-600 text-lg mb-2">لا توجد كتب في هذا القسم</p>
                <p className="text-gray-500 text-sm mb-4">جرب تغيير الفئة لعرض محتوى آخر</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
