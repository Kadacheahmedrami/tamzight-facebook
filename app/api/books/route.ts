import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allBooks = [
  {
    id: 1,
    title: "السهل والميسر في تعلم اللغة الامازيغية",
    content: "كتاب شامل لتعليم اللغة الامازيغية من البداية للمتقدمين",
    author: "ابوبكر هارون",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "كتاب",
    subcategory: "language",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
    pages: 250,
    language: "عربي - امازيغي",
    isbn: "978-123-456-789-0",
  },
  {
    id: 2,
    title: "قاموس اللغة الامازيغية الشامل",
    content: "قاموس شامل للكلمات والمصطلحات الامازيغية مع الترجمة والنطق",
    author: "ابوبكر هارون",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "كتاب",
    subcategory: "dictionaries",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
    pages: 500,
    language: "متعدد اللغات",
    isbn: "978-123-456-789-1",
  },
  {
    id: 3,
    title: "تاريخ الحضارة الأمازيغية",
    content: "دراسة شاملة لتاريخ وحضارة الشعب الأمازيغي عبر العصور",
    author: "د. محمد أمازيغ",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "كتاب",
    subcategory: "atlas",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 180, likes: 890, comments: 67, shares: 8 },
    pages: 400,
    language: "عربي",
    isbn: "978-123-456-789-2",
  },
  {
    id: 4,
    title: "اللهجات الأمازيغية المتنوعة",
    content: "دراسة مقارنة للهجات الأمازيغية في شمال أفريقيا",
    author: "د. لغوي أمازيغي",
    timestamp: "نشر بتاريخ 02-04-2023 الساعة 09:15 صباحاً",
    category: "كتاب",
    subcategory: "dialects",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 290, likes: 950, comments: 72, shares: 14 },
    pages: 320,
    language: "عربي - امازيغي",
    isbn: "978-123-456-789-3",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let filteredBooks = [...allBooks]

  // Filter by category
  if (category && category !== "all") {
    filteredBooks = filteredBooks.filter((book) => book.subcategory === category)
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredBooks = filteredBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.content.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm),
    )
  }

  return NextResponse.json(filteredBooks)
}
