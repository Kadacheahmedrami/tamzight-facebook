import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allTruths = [
  {
    id: 1,
    title: "هويتنا امازيغية افريقية",
    content:
      "الامازيغية هويتُنا *** الامازيغية ثقافتُنا *** الامازيغية حضارتُنا*** الامازيغية وحدتُنا *** الامازيغية قوتُنا *** الامازيغية دمُنا",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "حقيقة",
    subcategory: "nation",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
  {
    id: 2,
    title: "الأمازيغ هم السكان الأصليون لشمال أفريقيا",
    content: "حقيقة تاريخية مؤكدة بالأدلة الأثرية واللغوية والجينية تؤكد أن الأمازيغ هم السكان الأصليون لشمال أفريقيا",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "حقيقة",
    subcategory: "civilization",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
  },
  {
    id: 3,
    title: "اللغة الأمازيغية من أقدم اللغات في العالم",
    content: "تعتبر اللغة الأمازيغية من أقدم اللغات المكتوبة في التاريخ، مع وجود نقوش تيفيناق التي تعود لآلاف السنين",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "حقيقة",
    subcategory: "language",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 180, likes: 890, comments: 67, shares: 8 },
  },
  {
    id: 4,
    title: "الفن الأمازيغي يعكس عمق الحضارة",
    content: "الفنون الأمازيغية من نقوش ورسوم وحرف يدوية تعكس عمق وأصالة الحضارة الأمازيغية",
    author: "فنان أمازيغي",
    timestamp: "نشر بتاريخ 02-04-2023 الساعة 16:10 مساء",
    category: "حقيقة",
    subcategory: "art",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 210, likes: 750, comments: 42, shares: 6 },
  },
  {
    id: 5,
    title: "اللباس الأمازيغي رمز للهوية",
    content: "الملابس التقليدية الأمازيغية ليست مجرد زي، بل رم�� للهوية والانتماء الثقافي",
    author: "مصممة أزياء تراثية",
    timestamp: "نشر بتاريخ 03-04-2023 الساعة 11:30 صباحاً",
    category: "حقيقة",
    subcategory: "clothing",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 195, likes: 680, comments: 38, shares: 9 },
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let filteredTruths = [...allTruths]

  // Filter by category
  if (category && category !== "all") {
    filteredTruths = filteredTruths.filter((truth) => truth.subcategory === category)
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredTruths = filteredTruths.filter(
      (truth) =>
        truth.title.toLowerCase().includes(searchTerm) ||
        truth.content.toLowerCase().includes(searchTerm) ||
        truth.author.toLowerCase().includes(searchTerm),
    )
  }

  return NextResponse.json(filteredTruths)
}
