"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, X, User } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  type: string
  url?: string // Made optional since we'll generate URLs dynamically
  avatar?: string
  createdAt: string
}

interface SearchComponentProps {
  isAuthenticated: boolean
  isMobile?: boolean
}

export default function SearchComponent({ isAuthenticated, isMobile = false }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Function to generate dynamic URLs based on type and id
  const generateUrl = (result: SearchResult): string => {
    // If URL is already provided, use it
    if (result.url) return result.url
    
    // Map Arabic types to route segments
    const typeRouteMap: { [key: string]: string } = {
      'مستخدم': 'member',
      'منشور': 'posts', 
      'كتاب': 'books',
      'سؤال': 'questions',
      'حقيقة': 'truths',
      'صورة': 'images',
      'فيديو': 'videos',
      'فكرة': 'ideas',
      'إعلان': 'ads',
      'منتج': 'products',
    }
    
    const routeSegment = typeRouteMap[result.type]
    
    if (!routeSegment) {
      // Fallback for unknown types
      console.warn(`Unknown type: ${result.type}`)
      return `/main/posts/${result.id}` // Default fallback
    }
    
    return `/main/${routeSegment}/${result.id}`
  }

  // Handle search function
  const performSearch = async (query: string) => {
    if (query.trim().length > 2) {
      setSearchLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
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
  }

  // Handle search button click
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery)
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

  // Function to get type-specific styling
  const getTypeStyle = (type: string) => {
    const styles = {
      'مستخدم': 'bg-green-500 text-white',
      'منشور': 'bg-blue-500 text-white',
      'كتاب': 'bg-purple-500 text-white',
      'سؤال': 'bg-orange-500 text-white',
      'حقيقة': 'bg-red-500 text-white',
      'صورة': 'bg-pink-500 text-white',
      'فيديو': 'bg-indigo-500 text-white',
      'فكرة': 'bg-yellow-500 text-white',
      'إعلان': 'bg-gray-500 text-white',
      'منتج': 'bg-emerald-500 text-white',
    }
    return styles[type as keyof typeof styles] || 'bg-[#4531fc] text-white'
  }

  // Dynamic sizing based on mobile/desktop and authentication
  const getInputHeight = () => {
    if (isMobile) {
      return isAuthenticated ? 'h-12' : 'h-10'
    }
    return isAuthenticated ? 'h-10' : 'h-8'
  }

  const getButtonSize = () => {
    if (isMobile) {
      return isAuthenticated ? 'h-10 w-10' : 'h-8 w-8'
    }
    return isAuthenticated ? 'h-8 w-8' : 'h-6 w-6'
  }

  const getIconSize = () => {
    if (isMobile) {
      return isAuthenticated ? 'h-5 w-5' : 'h-4 w-4'
    }
    return isAuthenticated ? 'h-4 w-4' : 'h-3 w-3'
  }

  const getAvatarSize = () => {
    return isMobile ? 'w-12 h-12' : 'w-10 h-10'
  }

  const getAvatarIconSize = () => {
    return isMobile ? 'w-6 h-6' : 'w-5 h-5'
  }

  const getTextSizes = () => {
    if (isMobile) {
      return {
        input: 'text-base',
        typeLabel: 'text-sm',
        title: 'text-base',
        content: 'text-sm',
        author: 'text-sm',
        loading: '',
        noResults: ''
      }
    }
    return {
      input: 'text-bold',
      typeLabel: 'text-xs',
      title: 'text-sm',
      content: 'text-xs',
      author: 'text-xs',
      loading: 'text-sm',
      noResults: 'text-sm'
    }
  }

  const textSizes = getTextSizes()

  return (
    <div className={`relative ${isMobile ? 'flex-1' : `flex-1 mx-4 ${isAuthenticated ? 'max-w-2xl' : 'max-w-md'}`}`} ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="أبحث في الامازيغية هويتنا"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`pl-12 pr-8 text-right ${textSizes.input} bg-gray-50 border-gray-300 focus:bg-white focus:border-[#4531fc] placeholder:text-gray-500 rounded-lg ${getInputHeight()}`}
        />
        
        {/* Search Button - Inside Input */}
        <button 
          onClick={handleSearchClick}
          className={`absolute left-1 top-1/2 transform -translate-y-1/2 transition-colors flex justify-center items-center rounded-md ${getButtonSize()}`}
        >
          <Search className={`text-gray-500 ${getIconSize()}`} />
        </button>
        
        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className={getIconSize()} />
          </button>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {showResults && (
        <div className={`absolute top-full left-0 right-0 mt-${isMobile ? '2' : '1'} bg-white border border-gray-200 rounded-lg shadow-xl ${isMobile ? 'max-h-80' : 'max-h-96'} overflow-y-auto z-50`}>
          {searchLoading ? (
            <div className={`${isMobile ? 'p-6' : 'p-4'} text-center text-gray-600 ${textSizes.loading}`}>جاري البحث...</div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={generateUrl(result)}
                  onClick={() => setShowResults(false)}
                  className={`block ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar for users or type icon */}
                    <div className="flex-shrink-0">
                      {result.type === 'مستخدم' ? (
                        result.avatar ? (
                          <img 
                            src={result.avatar} 
                            alt={result.title}
                            className={`${getAvatarSize()} rounded-full object-cover`}
                          />
                        ) : (
                          <div className={`${getAvatarSize()} rounded-full bg-gray-200 flex items-center justify-center`}>
                            <User className={`${getAvatarIconSize()} text-gray-500`} />
                          </div>
                        )
                      ) : (
                        <div className={`${getAvatarSize()} rounded-full flex items-center justify-center ${isMobile ? 'text-sm' : 'text-xs'} font-bold ${getTypeStyle(result.type)}`}>
                          {result.type.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 ${isMobile ? 'mb-2' : 'mb-1'}`}>
                        <span className={`${textSizes.typeLabel} px-2 py-1 rounded-full font-medium ${getTypeStyle(result.type)}`}>
                          {result.type}
                        </span>
                      </div>
                      <h4 className={`font-medium ${textSizes.title} line-clamp-1 ${isMobile ? 'mb-2' : 'mb-1'} text-gray-900`}>{result.title}</h4>
                      <p className={`${textSizes.content} text-gray-600 line-clamp-2 ${isMobile ? 'mb-2' : 'mb-1'}`}>{result.content}</p>
                      {result.type !== 'مستخدم' && (
                        <p className={`${textSizes.author} text-gray-500`}>بواسطة {result.author}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`${isMobile ? 'p-6' : 'p-4'} text-center text-gray-600 ${textSizes.noResults}`}>لا توجد نتائج للبحث</div>
          )}
        </div>
      )}
    </div>
  )
}