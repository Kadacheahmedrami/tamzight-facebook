import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allAds = [
  {
    id: 1,
    title: "دعوة للمساهمة في بناء مدرسة امازيغية",
    content: "ندعوكم للمساهمة في بناء مدرسة جديدة لتعليم اللغة الأمازيغية في قرية ايت سليم",
    author: "جمعية التنمية المحلية",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "إعلان خيري",
    subcategory: "charity",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
    targetAmount: "50000",
    currentAmount: "25000",
    deadline: "2024-06-01",
  },
  {
    id: 2,
    title: "فرصة عمل في شركة امازيغية للتكنولوجيا",
    content: "تعلن شركة امازيغ تك عن توفر فرصة عمل في مجال التسويق الرقمي والمحتوى",
    author: "شركة امازيغ تك",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "إعلان وظيفي",
    subcategory: "jobs",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
    position: "مسوق رقمي",
    location: "الرباط، المغرب",
    salary: "8000-12000 درهم",
  },
  {
    id: 3,
    title: "مهرجان الثقافة الأمازيغية السنوي",
    content: "دعوة للمشاركة في المهرجان السنوي للثقافة الأمازيغية بمدينة أكادير",
    author: "وزارة الثقافة",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "إعلان فعالية",
    subcategory: "events",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 180, likes: 890, comments: 67, shares: 8 },
    eventDate: "2024-07-15",
    location: "أكادير",
    ticketPrice: "مجاني",
  },
  {
    id: 4,
    title: "مساعدات غذائية للأسر المحتاجة",
    content: "توزيع مساعدات غذائية على الأسر الأمازيغية المحتاجة في المناطق النائية",
    author: "جمعية الخير الأمازيغية",
    timestamp: "نشر بتاريخ 02-04-2023 الساعة 14:20 مساء",
    category: "إعلان مساعدة",
    subcategory: "assistance",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 380, likes: 1150, comments: 92, shares: 28 },
    beneficiaries: "500 أسرة",
    location: "المناطق الجبلية",
  },
  {
    id: 5,
    title: "منتجات حرفية امازيغية أصيلة",
    content: "عرض خاص على المنتجات الحرفية الأمازيغية التقليدية المصنوعة يدوياً",
    author: "تعاونية الحرفيين",
    timestamp: "نشر بتاريخ 03-04-2023 الساعة 16:45 مساء",
    category: "إعلان منتج",
    subcategory: "products",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 220, likes: 780, comments: 56, shares: 15 },
    discount: "20%",
    validUntil: "2024-05-01",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let filteredAds = [...allAds]

  // Filter by category
  if (category && category !== "all") {
    filteredAds = filteredAds.filter((ad) => ad.subcategory === category)
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredAds = filteredAds.filter(
      (ad) =>
        ad.title.toLowerCase().includes(searchTerm) ||
        ad.content.toLowerCase().includes(searchTerm) ||
        ad.author.toLowerCase().includes(searchTerm),
    )
  }

  return NextResponse.json(filteredAds)
}
