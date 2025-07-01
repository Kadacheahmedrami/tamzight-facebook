"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Heart, MessageCircle, Share2, Calendar, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"

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

export default function AdsPage() {
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/ads")
        const data = await response.json()
        setAds(data)
      } catch (error) {
        console.error("Error fetching ads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto flex">
          <Sidebar />
          <div className="flex-1 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
          </div>
          <div className="w-64 p-4">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
              <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>اعلانات امازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">اعرض اعلانات قسم:</label>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="charity">اعلانات لأعمال خيرية</SelectItem>
                    <SelectItem value="assistance">اعلانات لمساعدات</SelectItem>
                    <SelectItem value="products">اعلانات لمنتجات</SelectItem>
                    <SelectItem value="events">اعلانات لمناسبات</SelectItem>
                    <SelectItem value="jobs">اعلانات وظائف</SelectItem>
                    <SelectItem value="all">الجميع</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">اعرض القسم</Button>
              </div>
            </div>

            {/* Ads Grid */}
            <div className="space-y-6">
              {ads.map((ad) => (
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

                        {/* Specific Ad Details */}
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
                          </div>
                        )}

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
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
