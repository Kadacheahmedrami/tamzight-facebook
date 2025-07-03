"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import UserActions from "./UserActions"

interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  type: string
  url: string
}

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ClientHeaderProps {
  user: User | null
}

export default function ClientHeader({ user }: ClientHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setSearchLoading(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          const results = await response.json()
          setSearchResults(results)
          setShowResults(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* User Actions - Right Section */}
          <UserActions user={user} />

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-4 sm:mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="أبحث في الامازيغية هويتنا"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-4 text-right text-sm h-10 bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-600 text-sm">جاري البحث...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        onClick={() => setShowResults(false)}
                        className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                {result.type}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm line-clamp-1 mb-1 text-gray-900">{result.title}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{result.content}</p>
                            <p className="text-xs text-gray-500">بواسطة {result.author}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-600 text-sm">لا توجد نتائج للبحث</div>
                )}
              </div>
            )}
          </div>

          {/* Logo and Site Name - Left */}
          <div className="flex items-center gap-2">
            <Link href="/main" className="flex items-center gap-2">
              <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-8 sm:h-10 w-auto" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}