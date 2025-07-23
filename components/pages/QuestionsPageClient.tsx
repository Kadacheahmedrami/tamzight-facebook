"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { QuestionCard } from "@/components/Cards/QuestionCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus } from "lucide-react"
import { QuestionUploadModal } from "@/components/UploadModals/QuestionUploadModal"

interface Question {
  id: string
  title: string
  content: string
  category: string
  tags?: string[]
  isAnswered: boolean
  answerCount: number
  views: number
  votes: number
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    id: string
    username: string
    profileImage?: string
  }
}

interface QuestionsPageClientProps {
  initialQuestions: Question[]
  totalQuestions: number
  currentPage: number
  categories: string[]
}

export function QuestionsPageClient({
  initialQuestions,
  totalQuestions,
  currentPage,
  categories,
}: QuestionsPageClientProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [page, setPage] = useState(currentPage)
  const [total, setTotal] = useState(totalQuestions)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
        category: selectedCategory,
        sortBy: sortBy,
      })

      const response = await fetch(`/api/questions?${params}`)
      const data = await response.json()

      setQuestions(data.questions || [])
      setTotal(data.totalQuestions || data.total || 0)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [page, searchTerm, selectedCategory, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchQuestions()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setPage(1)
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Ask questions and get answers from the community</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ask Question
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="votes">Most Voted</SelectItem>
              <SelectItem value="answers">Most Answers</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No questions found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading}>
            Previous
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages} ({total} total questions)
          </span>

          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      <QuestionUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false)
          fetchQuestions()
        }}
      />
    </div>
  )
}
