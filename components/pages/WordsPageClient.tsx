"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import WordCard from "@/components/Cards/WordCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { WordUploadModal } from "@/components/UploadModals/WordUploadModal" 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, Search, Plus } from "lucide-react"

// Types
type ExtendedSession = {
  user?: {
    id?: string
    email?: string
    name?: string
  }
} | null

type PaginationInfo = {
  currentPage: number
  totalPages: number
  totalWords: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
}

type Pronunciation = {
  id: string
  accent: string
  pronunciation: string
  createdAt: string // ISO string (from server)
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

type ReactionSummary = {
  emoji: string
  count: number
  users: Array<{
    userId: string
    userName: string
    userAvatar: string | null
    createdAt: string
  }>
}

type Word = {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  authorAvatar: string | null
  timestamp: string
  category: string
  subcategory: string
  image: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
    pronunciations: number
  }
  userHasLiked: boolean
  userReaction: string | null
  reactions: {
    total: number
    summary: ReactionSummary[]
    details: Record<string, ReactionSummary[]>
  }
  pronunciations: {
    total: number
    byAccent: Record<string, Pronunciation[]>
    recent: Pronunciation[]
  }
}

type WordsPageClientProps = {
  session: any
  searchParams: {
    category?: string
    search?: string
    page?: string
  }
}

export default function WordsPageClient({
  session,
  searchParams,
}: WordsPageClientProps) {
  const router = useRouter()

  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [isWordModalOpen, setIsWordModalOpen] = useState(false)

  const WORDS_PER_PAGE = 5 // Match server-side limit

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const categories = useMemo(
    () => [
      { value: "all", label: "الجميع" },
      { value: "nouns", label: "أسماء" },
      { value: "verbs", label: "أفعال" },
      { value: "adjectives", label: "صفات" },
      { value: "expressions", label: "تعابير" },
      { value: "phrases", label: "عبارات" },
      { value: "proverbs", label: "أمثال" },
    ],
    []
  )

  useEffect(() => {
    if (!initialized) {
      setSelectedCategory(searchParams.category || "all")
      setSearchQuery(searchParams.search || "")
      setCurrentPage(parseInt(searchParams.page || "1") || 1)
      setInitialized(true)
    }
  }, [searchParams, initialized])

  const extendedSession: ExtendedSession = useMemo(() => {
    if (!session) return null
    return {
      user: {
        id: (session.user as { id?: string })?.id || undefined,
        email: session.user?.email || undefined,
        name: session.user?.name || undefined,
      },
    }
  }, [session])

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
          <div className="flex-row justify-start items-center mb-4 flex gap-3">
            <div className="h-4 py-2 bg-gray-200 rounded-full w-10"></div>
            <div className="bg-gray-200 rounded-full h-2 w-2"></div>
            <div className="h-4 py-2 bg-gray-200 rounded-full w-10"></div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-3"></div>
          <div className="flex gap-4">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const updateURL = useCallback(
    (category: string, search: string, page: number) => {
      const params = new URLSearchParams()
      if (category !== "all") params.set("category", category)
      if (search.trim()) params.set("search", search.trim())
      if (page > 1) params.set("page", page.toString())

      const queryString = params.toString()
      const url = queryString ? `?${queryString}` : ""

      router.replace(`/main/words${url}`, { scroll: false })
    },
    [router]
  )

  const fetchWords = useCallback(
    async (
      category = "all",
      search = "",
      page = 1,
      isLoadMore = false
    ): Promise<void> => {
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
          limit: WORDS_PER_PAGE.toString(),
        })
        if (category !== "all") params.set("category", category)
        if (search.trim()) params.set("search", search.trim())

        console.log(
          `Fetching words: category=${category}, search=${search}, page=${page}, isLoadMore=${isLoadMore}`
        )

        const response = await fetch(`/api/main/words?${params}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        console.log("API Response data:", data)
        
        // Transform server response directly to client-friendly format
        const transformedWords: Word[] =
          data.words?.map((word: any) => ({
            id: String(word.id),
            title: word.title ?? "كلمة غير محددة",
            content: word.content ?? "محتوى غير متوفر",
            author: word.author ?? "مستخدم غير معروف",
            authorId: word.authorId ?? "unknown",
            authorAvatar: word.authorAvatar ?? null,
            timestamp: word.timestamp ?? "غير محدد",
            category: word.category ?? "عام",
            subcategory: word.subcategory ?? "",
            image: word.image ? word.image : "/placeholder.svg?height=300&width=600",
            stats: {
              views: word.stats?.views ?? 0,
              likes: word.stats?.likes ?? 0,
              comments: word.stats?.comments ?? 0,
              shares: word.stats?.shares ?? 0,
              pronunciations: word.stats?.pronunciations ?? 0,
            },
            userHasLiked: word.userHasLiked ?? false,
            userReaction: word.userReaction ?? null,
            reactions: {
              total: word.reactions?.total ?? 0,
              summary: word.reactions?.summary ?? [],
              details: word.reactions?.details ?? {},
            },
            pronunciations: {
              total: word.pronunciations?.total ?? 0,
              byAccent: word.pronunciations?.byAccent ?? {},
              recent: word.pronunciations?.recent ?? [],
            },
          })) || []

        setPagination(data.pagination)
         
        if (isLoadMore) {
          setWords((prev) => {
            // Avoid duplicates by id
            const existingIds = new Set(prev.map((w) => w.id))
            const newWords = transformedWords.filter((w) => !existingIds.has(w.id))
            console.log(
              `Adding ${newWords.length} new words to existing ${prev.length} words`
            )
            return [...prev, ...newWords]
          })
        } else {
          setWords(transformedWords)
          console.log(`Replaced with ${transformedWords.length} words`,transformedWords)
        }

        if (!isLoadMore) {
          updateURL(category, search, page)
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was aborted")
          return
        }

        console.error("Error fetching words:", error)
        setError("فشل في تحميل الكلمات. يرجى المحاولة مرة أخرى.")

        if (page === 1 && !isLoadMore) {
          setWords([])
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
    [WORDS_PER_PAGE, updateURL]
  )

  const loadMore = useCallback(() => {
    if (
      !loadingMore &&
      !isLoadingRef.current &&
      pagination?.hasNextPage &&
      words.length > 0
    ) {
      const nextPage = currentPage + 1
      console.log(`Loading more words: page ${nextPage}`)
      setCurrentPage(nextPage)
      fetchWords(selectedCategory, searchQuery, nextPage, true)
    }
  }, [
    loadingMore,
    pagination?.hasNextPage,
    words.length,
    selectedCategory,
    searchQuery,
    currentPage,
    fetchWords,
  ])

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!pagination?.hasNextPage || loadingMore || isLoadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (
          target.isIntersecting &&
          !isLoadingRef.current &&
          pagination?.hasNextPage
        ) {
          console.log("Intersection observer triggered")
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
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

  const handleWordDelete = useCallback((wordId: string) => {
    setWords((prev) => prev.filter((word) => word.id !== wordId))
    setPagination((prev) =>
      prev
        ? {
            ...prev,
            totalWords: prev.totalWords - 1,
          }
        : null
    )
  }, [])

  const handleWordUpdate = useCallback(
    (wordId: string, updatedData: Partial<Word>) => {
      setWords((prev) =>
        prev.map((word) =>
          word.id === wordId
            ? {
                ...word,
                ...updatedData,
                reactions: updatedData.reactions
                  ? {
                      ...word.reactions,
                      ...updatedData.reactions,
                    }
                  : word.reactions,
                pronunciations: updatedData.pronunciations
                  ? {
                      ...word.pronunciations,
                      ...updatedData.pronunciations,
                    }
                  : word.pronunciations,
              }
            : word
        )
      )
    },
    []
  )

  const handleNewWord = useCallback(
    (newWord: Partial<Word>) => {
      const transformedWord: Word = {
        id: newWord.id?.toString() || Math.random().toString(36).substr(2, 9),
        title: newWord.title || "كلمة غير محددة",
        content: newWord.content || "محتوى غير متوفر",
        author:
          session?.user?.name || session?.user?.email || "مستخدم غير معروف",
        authorId: (session?.user as { id?: string })?.id || "unknown",
        authorAvatar: null,
        timestamp: new Date().toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: newWord.category || "عام",
        subcategory: newWord.subcategory || "",
        image: newWord.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          pronunciations: 0,
        },
        userHasLiked: false,
        userReaction: null,
        reactions: {
          total: 0,
          summary: [],
          details: {},
        },
        pronunciations: {
          total: 0,
          byAccent: {},
          recent: [],
        },
      }
      setWords((prev) => [transformedWord, ...prev])
      setPagination((prev) =>
        prev
          ? {
              ...prev,
              totalWords: prev.totalWords + 1,
            }
          : null
      )
    },
    [session]
  )

  const handleCategoryChange = useCallback(
    (category: string) => {
      console.log(`Changing category to: ${category}`)
      setSelectedCategory(category)
      setCurrentPage(1)
      setWords([])
      setPagination(null)
      setError(null)

      fetchWords(category, searchQuery, 1, false)
    },
    [fetchWords, searchQuery]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(() => {
        console.log(`Searching for: ${value}`)
        setCurrentPage(1)
        setWords([])
        setPagination(null)
        setError(null)
        fetchWords(selectedCategory, value, 1, false)
      }, 300)
    },
    [selectedCategory, fetchWords]
  )

  const handleRefresh = useCallback(() => {
    console.log("Refreshing words")
    setCurrentPage(1)
    setWords([])
    setPagination(null)
    setError(null)
    fetchWords(selectedCategory, searchQuery, 1, false)
  }, [selectedCategory, searchQuery, fetchWords])

  const handleWordUploadSuccess = useCallback(() => {
    // Close the modal and refresh the words list
    setIsWordModalOpen(false)
    handleRefresh()
  }, [handleRefresh])

  const handleOpenWordModal = useCallback(() => {
    setIsWordModalOpen(true)
  }, [])

  const handleCloseWordModal = useCallback(() => {
    setIsWordModalOpen(false)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (initialized) {
      fetchWords(selectedCategory, searchQuery, currentPage, false)
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
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const getCurrentCategoryLabel = () => {
    return categories.find((cat) => cat.value === selectedCategory)?.label || "الجميع"
  }
   console.log("WordsPageClient rendered with props:", words)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-xl md:text-2xl text-gray-600">
          <span>قاموس الكلمات الأمازيغية</span>
        </div>
      </nav>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-4 border space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض كلمات من فئة:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار فئة لعرضها" />
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
            {loading ? "جاري التحميل..." : "تحديث"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="ابحث في الكلمات والمعاني والمؤلفين..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {pagination && (
        <div className="mb-4 text-sm text-gray-600">
          <span>
            عرض {words.length} من أصل {pagination.totalWords} كلمة
            {selectedCategory !== "all" && <span className="mr-2">• الفئة: {getCurrentCategoryLabel()}</span>}
            {searchQuery.trim() && <span className="mr-2">• البحث: "{searchQuery}"</span>}
          </span>
        </div>
      )}

      {/* Add Word Section - Only show for authenticated users */}
      {session && (
        <>
          <Dialog open={isWordModalOpen} onOpenChange={setIsWordModalOpen}>
            <DialogTrigger asChild>
              <div className="border rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                  <Input
                    placeholder="أضف جملة جديدة للقاموس الأمازيغي"
                    className="flex-1 cursor-pointer text-sm sm:text-base"
                    readOnly
                  />
                </div>
              </div>
            </DialogTrigger>
          </Dialog>
          
      
           {/* Word Upload Modal */}
      <WordUploadModal
        isOpen={isWordModalOpen}
        onClose={handleCloseWordModal}
        onSuccess={handleWordUploadSuccess}
      />
        </>
      )}

    

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <Button size="sm" onClick={handleRefresh} className="mt-2" variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      )}

      {loading && words.length === 0 && <LoadingSkeleton />}

      <div className="space-y-4">
        {words.length > 0 ? (
          <>
            {words.map((word, index) => (
              <WordCard
                key={`${word.id}-${index}`}
                id={String(word.id)} // Explicit string id prop
                title={word.title}
                content={word.content}
                author={word.author}
                authorId={word.authorId}
                authorAvatar={word.authorAvatar}
                timestamp={word.timestamp}
                category={word.category}
                subcategory={word.subcategory}
                image={word.image}
                stats={word.stats}
                session={extendedSession}
                onDelete={handleWordDelete}
                onUpdate={handleWordUpdate}
                userHasLiked={word.userHasLiked}
                userReaction={word.userReaction}
                reactions={word.reactions}
                pronunciations={word.pronunciations}
                apiEndpoint={"words"}
                detailsRoute={"/main/words"}
              />
            ))}

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

            {pagination && !pagination.hasNextPage && words.length > 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-gray-400 text-4xl mb-2">📚</div>
                  <p className="text-gray-600 text-sm">تم عرض جميع الكلمات</p>
                  {pagination.totalWords > 0 && (
                    <p className="text-gray-500 text-xs mt-1">إجمالي {pagination.totalWords} كلمة</p>
                  )}
                </div>
              </div>
            )}

            {error && words.length > 0 && (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل المزيد من الكلمات</p>
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
                <p className="text-gray-600 text-lg mb-2">
                  {searchQuery.trim()
                    ? `لا توجد كلمات تطابق البحث "${searchQuery}"`
                    : "لا توجد كلمات في هذه الفئة"}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {searchQuery.trim() ? "جرب البحث بكلمات أخرى أو غير الفئة" : "جرب تغيير الفئة لعرض محتوى آخر"}
                </p>
                {searchQuery.trim() && (
                  <Button onClick={() => handleSearchChange("")} variant="outline" size="sm">
                    مسح البحث
                  </Button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}