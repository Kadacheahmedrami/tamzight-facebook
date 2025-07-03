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
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  // Check if user is authenticated
  const isAuthenticated = user && user.id

  // Logo rotation array
  const logos = [
    "/logo/logo4.png",
    "/logo/logo3.png",
    "/logo/logo2.png",
    "/logo/logo1.png"
  ]

  // Logo rotation effect
  useEffect(() => {
    const logoInterval = setInterval(() => {
      setCurrentLogoIndex((prevIndex) => (prevIndex + 1) % logos.length)
    }, 2000) // Change every 2 seconds

    return () => clearInterval(logoInterval)
  }, [logos.length])

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

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl  mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* User Actions - Right Section */}
            <UserActions user={user} />

            {/* Search Bar - Center (Desktop Only) */}
            <div className="hidden md:flex  flex-row  justify-center items-center  md:w-[700px]">
              <div className={`flex-1 mx-4 relative ${isAuthenticated ? 'max-w-2xl' : 'max-w-md'}`} ref={searchRef}>
                <div className="relative flex">
                  <Input
                    type="text"
                    placeholder="أبحث في الامازيغية هويتنا"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`pl-4 pr-10 text-right text-bold bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 placeholder:text-gray-500 rounded-[8px] mr-1 ${isAuthenticated ? 'h-10' : 'h-8'}`}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <X className={`${isAuthenticated ? 'h-4 w-4' : 'h-3 w-3'}`} />
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
              
              {/* Search Button - Now functional */}
              <button 
                onClick={handleSearchClick}
                className={`bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors flex justify-center items-center rounded-l-[4px] border  border-r-0 ${isAuthenticated ? 'h-[37px] w-[37px]' : 'h-[30px] w-[30px]'}`}
              >
                <Search className={`text-[#4531fc] font-extrabold ${isAuthenticated ? 'h-6 w-6' : 'h-4 w-4'}`} />
              </button>
            </div>

            {/* Logo and Site Name - Left */}
            <div className="flex items-center gap-2">
              <Link href="/main" className="flex items-center gap-2">
                <h1 className="text-[#4531fc] text-3xl font-extrabold">
                  TAMAZIGHT
                </h1>
                <img 
                  src={logos[currentLogoIndex]} 
                  alt="Tamazight Logo" 
                  className="h-8 sm:h-10 w-auto transition-opacity duration-300" 
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar - Below Header */}
      <div className="md:hidden bg-white w-full  border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4 ">
          <div className="relative w-full  flex flex-row" ref={searchRef}>
            <div className="relative flex gap-2 flex-row w-full  ">
              <Input
                type="text"
                placeholder="أبحث في الامازيغية هويتنا"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`pl-4  ml-4 pr-12 text-right text-bold bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 placeholder:text-gray-500 rounded-r-[12px]  text-base ${isAuthenticated ? 'h-12' : 'h-10'}`}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute left-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <X className={`${isAuthenticated ? 'h-5 w-5' : 'h-4 w-4'}`} />
                </button>
              )}
            </div>
            
            {/* Search Button - Mobile */}
            <button 
              onClick={handleSearchClick}
              className={` left-0 top-0 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors flex justify-center items-center rounded-l-[8px] border border-gray-300 border-r-0 ${isAuthenticated ? 'h-12 w-12' : 'h-10 w-10'}`}
            >
              <Search className={`text-[#4531fc] font-extrabold ${isAuthenticated ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </button>
            
            {/* Mobile Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-6 text-center text-gray-600">جاري البحث...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        onClick={() => setShowResults(false)}
                        className="block px-4 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                {result.type}
                              </span>
                            </div>
                            <h4 className="font-medium text-base line-clamp-1 mb-2 text-gray-900">{result.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{result.content}</p>
                            <p className="text-sm text-gray-500">بواسطة {result.author}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-600">لا توجد نتائج للبحث</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}