"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, MessageCircle, Share2, Calendar, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"
import CreatePostModal from "@/components/create-post/create-post-modal"


interface AdData {
  id: number
  title: string
  content: string
  author: string
  timestamp: string
  category: string
  image: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  targetAmount?: string
  currentAmount?: string
  deadline?: string
  position?: string
  location?: string
  salary?: string
  eventDate?: string
  ticketPrice?: string
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border overflow-hidden animate-pulse">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <div className="w-full h-48 md:h-full bg-gray-200" />
          </div>
          <div className="md:w-2/3 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
            
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-3 w-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default function AdsPage() {
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchAds = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/ads" : `/api/main/ads?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setAds(data)
    } catch (error) {
      console.error("Error fetching ads:", error)
      // Fallback sample data
      const sampleAds: AdData[] = [
        // Sample data would go here
      ]
      setAds(sampleAds)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchAds(category)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb - Always visible */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>اعلانات امازيغية متنوعة</span>
        </div>
      </nav>

      {/* Filter - Always visible */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض اعلانات قسم:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="اختار قسم لعرضه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="charity">اعلانات لأعمال خيرية</SelectItem>
              <SelectItem value="assistance">اعلانات لمساعدات</SelectItem>
              <SelectItem value="products">اعلانات لمنتجات</SelectItem>
              <SelectItem value="events">اعلانات لمناسبات</SelectItem>
              <SelectItem value="jobs">اعلانات وظائف</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={() => fetchAds(selectedCategory)} 
            className="w-full bg-[#4531fc] hover:bg-blue-800  sm:w-auto"
          >
            اعرض القسم
          </Button>
        </div>
      </div>


      <CreatePostModal />
      {/* Ads Grid */}
      <div className="space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : ads.length > 0 ? (
          ads.map((ad) => (
            <Card key={ad.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <Image
                    src={ad.image || "/placeholder.svg"}
                    alt={ad.title}
                    width={400}
                    height={250}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{ad.category}</Badge>
                      <span className="text-xs text-gray-500">{ad.timestamp}</span>
                    </div>
                    <CardTitle className="text-xl">{ad.title}</CardTitle>
                    <CardDescription>بواسطة {ad.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{ad.content}</p>

                    {/* Charity/Fundraising Details */}
                    {ad.targetAmount && (
                      <div className="bg-green-50 p-3 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">الهدف المالي:</span>
                          <span className="text-green-600 font-bold">{ad.targetAmount} درهم</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">المبلغ المجمع:</span>
                          <span className="text-blue-600 font-bold">{ad.currentAmount} درهم</span>
                        </div>
                        {ad.deadline && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>آخر موعد: {ad.deadline}</span>
                          </div>
                        )}
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (parseInt(ad.currentAmount || "0") / parseInt(ad.targetAmount || "1")) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Job Details */}
                    {ad.position && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">المنصب:</span>
                          <span className="font-bold">{ad.position}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4" />
                          <span>{ad.location}</span>
                        </div>
                        {ad.salary && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{ad.salary}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Event Details */}
                    {ad.eventDate && (
                      <div className="bg-purple-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>تاريخ الفعالية: {ad.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4" />
                          <span>{ad.location}</span>
                        </div>
                        {ad.ticketPrice && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>سعر التذكرة: {ad.ticketPrice}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.stats.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {ad.stats.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {ad.stats.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          {ad.stats.shares}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          تفاصيل أكثر
                        </Button>
                        <Button size="sm">
                          {ad.targetAmount ? "تبرع الآن" : ad.position ? "تقدم للوظيفة" : "احجز مكانك"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center  py-8 text-gray-500">
            لا توجد اعلانات في هذا القسم
            {selectedCategory !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all")
                  fetchAds("all")
                }}
                className="mt-4 "
              >
                عرض جميع الاعلانات
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}