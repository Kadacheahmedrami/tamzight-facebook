"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BookCard } from "@/components/Cards/BookCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus } from "lucide-react"
import { BookUploadModal } from "@/components/UploadModals/BookUploadModal"

interface Book {
  id: string
  title: string
  author: string
  description: string
  coverImageUrl?: string
  isbn?: string
  publishedDate?: string
  genre: string
  pages?: number
  language?: string
  publisher?: string
  rating?: number
  price?: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    id: string
    username: string
    profileImage?: string
  }
}

interface BooksPageClientProps {
  initialBooks: Book[]
  totalBooks: number
  currentPage: number
  genres: string[]
}

export function BooksPageClient({ initialBooks, totalBooks, currentPage, genres }: BooksPageClientProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [page, setPage] = useState(currentPage)
  const [total, setTotal] = useState(totalBooks)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
        genre: selectedGenre,
        sortBy: sortBy,
      })

      const response = await fetch(`/api/books?${params}`)
      const data = await response.json()

      setBooks(data.books || [])
      setTotal(data.totalBooks || data.total || 0)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [page, searchTerm, selectedGenre, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchBooks()
  }

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Books</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Discover and share your favorite books</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search books..."
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

          <Select value={selectedGenre} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
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
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="author">Author A-Z</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="published">Recently Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80"></div>
            </div>
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No books found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1 || loading}>
            Previous
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages} ({total} total books)
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

      <BookUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false)
          fetchBooks()
        }}
      />
    </div>
  )
}
