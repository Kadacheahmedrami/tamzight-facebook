"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import UserActions from "./UserActions"
import MobileUserMenu from "./MobileUserMenu"

interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  type: string
  url: string
}
interface Stats {
  posts: number
  truth: number
  questions: number
  books: number
  images: number
  videos: number
  ads: number
  shop: number
  ideas: number
  support: number
}

interface Message {
  id: number
  sender: string
  message: string 
  timestamp: string
  read: boolean
  avatar: string
}

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ClientHeaderProps {
  user: User | null
  stats?: Stats
}

export default function ClientHeader({ user ,stats }: ClientHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const pathname = usePathname()
  
  // Check if user is authenticated
  const isAuthenticated = user && user.id
  // Check if we're on the landing page
  const isLandingPage = pathname === "/"

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

  const unreadMessages = messages.filter((m) => !m.read).length

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Section - Authentication Status */}
            <div className="flex items-center gap-4">
              {isLandingPage && isAuthenticated ? (
                // Landing page + authenticated - show welcome + button only
                <div className="flex  items-center gap-4">
                  <div className=" sm:flex items-center gap-2 text-sm text-gray-600">
                   
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <Link href="/main">
                    <Button variant="outline" size="sm" className="text-base px-2 h-8 bg-[#4531fc] text-white border-[#4531fc] hover:bg-blue-600">
                      دخول
                    </Button>
                  </Link>
                </div>
              ) : (
                // All other cases - show UserActions
                <UserActions user={user} />
              )}
            </div>

            {/* Center Section - Search Bar or Marquee Text */}
            <div className="hidden md:flex flex-row justify-center items-center lg:w-[700px]">
              {!isLandingPage ? (
                // Search Bar for non-landing pages
                <div className={`flex-1 mx-4 relative ${isAuthenticated ? 'max-w-2xl' : 'max-w-md'}`} ref={searchRef}>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="أبحث في الامازيغية هويتنا"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`pl-12 pr-8 text-right text-bold bg-gray-50 border-gray-300 focus:bg-white focus:border-[#4531fc] placeholder:text-gray-500 rounded-lg ${isAuthenticated ? 'h-10' : 'h-8'}`}
                    />
                    
                    {/* Search Button - Inside Input */}
                    <button 
                      onClick={handleSearchClick}
                      className={`absolute left-1 top-1/2 transform -translate-y-1/2  transition-colors flex justify-center items-center rounded-md ${isAuthenticated ? 'h-8 w-8' : 'h-6 w-6'}`}
                    >
                      <Search className={`text-gray-500 ${isAuthenticated ? 'h-4 w-4' : 'h-3 w-3'}`} />
                    </button>
                    
                    {/* Clear Button */}
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
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
                                    <span className="text-base bg-[#4531fc] text-white px-2 py-1 rounded-full">
                                      {result.type}
                                    </span>
                                  </div>
                                  <h4 className="font-medium text-sm line-clamp-1 mb-1 text-gray-900">{result.title}</h4>
                                  <p className="text-base text-gray-600 line-clamp-2 mb-1">{result.content}</p>
                                  <p className="text-base text-gray-500">بواسطة {result.author}</p>
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
              ) : (
                // Marquee Text for landing page
                <div className="flex-1 mx-4 max-w-xl">
                  <div className="overflow-hidden whitespace-nowrap py-1 text-3xl  rounded-lg  ">
                    <div className="inline-block animate-marquee-ltr">
                      <span className="text-green-600 font-bold text-base px-6">
                        امازيغ الخلود *** امازيغ لن نزول *** ازول ولن نزول *** وتحيا الامازيغ الاحرار الشُرفاء أينما يكونون
                      </span>
                      <span className="text-green-600 font-bold text-base px-6">
                        امازيغ احرار *** خُلقنا احرار *** ونعيش احرار *** ونموت احرار
                      </span>
                      <span className="text-green-600 font-bold text-base px-6">
                        امازيغ باقون *** وبحضارتُنا مُستمرون *** وبثقافتُنا مُتمسكون *** وبعادتُنا مُعتزون *** وبتقاليدُنا نعيشون *** وبأمازيغيتُنا نفتخرون
                      </span>
                      <span className="text-green-600 font-bold text-base px-6">
                        الامازيغية هويتُنا *** الامازيغية ثقافتُنا *** الامازيغية حضارتُنا *** الامازيغية وحدتُنا *** الامازيغية قوتُنا *** الامازيغية دمُنا
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo and Site Name - Right */}
            <div className="flex items-center gap-2">
              <Link href={isAuthenticated ? "/main" : "/"} className="flex items-center gap-2">
                <h1 className="text-[#4531fc] hidden md:block text-xl md:text-3xl font-extrabold">
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

      {/* Mobile Search Bar - Below Header - Hide on Landing Page */}
      {!isLandingPage && (
        <div className="lg:hidden bg-white w-full border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="relative w-full flex flex-row items-center gap-2" ref={searchRef}>
              {/* Mobile Menu */}
              <div className="lg:hidden">
                <MobileUserMenu user={user} stats={stats} unreadMessages={unreadMessages} />
              </div>
              
              {/* Mobile Search Input */}
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="أبحث في الامازيغية هويتنا"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`pl-12 pr-8 text-right text-bold bg-gray-50 border-gray-300 focus:bg-white focus:border-[#4531fc] placeholder:text-gray-500 rounded-lg text-base ${isAuthenticated ? 'h-12' : 'h-10'}`}
                />
                
                {/* Mobile Search Button - Inside Input */}
                <button 
                  onClick={handleSearchClick}
                  className={`absolute left-1 top-1/2 transform -translate-y-1/2  transition-colors flex justify-center items-center rounded-md ${isAuthenticated ? 'h-10 w-10' : 'h-8 w-8'}`}
                >
                  <Search className={`text-gray-500 ${isAuthenticated ? 'h-5 w-5' : 'h-4 w-4'}`} />
                </button>
                
                {/* Mobile Clear Button */}
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <X className={`${isAuthenticated ? 'h-5 w-5' : 'h-4 w-4'}`} />
                  </button>
                )}
              </div>
              
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
                                <span className="text-base bg-[#4531fc] text-white px-2 py-1 rounded-full">
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
      )}

      {/* Mobile Marquee for Landing Page */}
      {isLandingPage && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-2">
            <div className="overflow-hidden whitespace-nowrap py-1  rounded-lg ">
              <div className="inline-block animate-marquee-ltr">
                <span className="text-green-600 font-medium text-base px-4">
                  امازيغ الخلود *** امازيغ لن نزول *** ازول ولن نزول *** وتحيا الامازيغ الاحرار الشُرفاء أينما يكونون
                </span>
                <span className="text-green-600 font-medium text-base px-4">
                  امازيغ احرار *** خُلقنا احرار *** ونعيش احرار *** ونموت احرار
                </span>
                <span className="text-green-600 font-medium text-base px-4">
                  امازيغ باقون *** وبحضارتُنا مُستمرون *** وبثقافتُنا مُتمسكون *** وبعادتُنا مُعتزون *** وبتقاليدُنا نعيشون *** وبأمازيغيتُنا نفتخرون
                </span>
                <span className="text-green-600 font-medium text-base px-4">
                  الامازيغية هويتُنا *** الامازيغية ثقافتُنا *** الامازيغية حضارتُنا *** الامازيغية وحدتُنا *** الامازيغية قوتُنا *** الامازيغية دمُنا
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-marquee-ltr {
          animation: marquee-ltr 25s linear infinite;
        }
        
        .animate-marquee-ltr:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  )
}