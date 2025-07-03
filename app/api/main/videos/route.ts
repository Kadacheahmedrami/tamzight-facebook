import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allVideos = [
  {
    id: 1,
    title: "تعلم الاعداد في اللغة الامازيغية",
    content: "فيديو تعليمي شامل لتعلم الاعداد في اللغة الامازيغية من 1 إلى 100",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "فيديو",
    subcategory: "educational",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
    duration: "15:30",
    quality: "HD",
    language: "امازيغي مع ترجمة عربية",
  },
  {
    id: 2,
    title: "رقصات امازيغية تقليدية من الأطلس",
    content: "فيديو يعرض الرقصات التقليدية الأمازيغية من منطقة الأطلس",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "فيديو",
    subcategory: "cultural",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
    duration: "8:45",
    quality: "4K",
    language: "موسيقى تقليدية",
  },
  {
    id: 3,
    title: "طبخ الكسكس الأمازيغي التقليدي",
    content: "تعلم طريقة تحضير الكسكس الأمازيغي التقليدي خطوة بخطوة",
    author: "الشيف أمينة",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "فيديو",
    subcategory: "cultural",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 180, likes: 890, comments: 67, shares: 8 },
    duration: "22:15",
    quality: "HD",
    language: "عربي",
  },
  {
    id: 4,
    title: "تاريخ الملوك الأمازيغ",
    content: "وثائقي تاريخي عن أهم الملوك والقادة في التاريخ الأمازيغي",
    author: "مؤرخ أمازيغي",
    timestamp: "نشر بتاريخ 02-04-2023 الساعة 18:20 مساء",
    category: "فيديو",
    subcategory: "historical",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 410, likes: 1350, comments: 98, shares: 25 },
    duration: "45:30",
    quality: "HD",
    language: "عربي مع ترجمة امازيغية",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let filteredVideos = [...allVideos]

  // Filter by category
  if (category && category !== "all") {
    filteredVideos = filteredVideos.filter((video) => video.subcategory === category)
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredVideos = filteredVideos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm) ||
        video.content.toLowerCase().includes(searchTerm) ||
        video.author.toLowerCase().includes(searchTerm),
    )
  }

  return NextResponse.json(filteredVideos)
}
