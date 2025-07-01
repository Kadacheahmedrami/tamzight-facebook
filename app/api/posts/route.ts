import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allPosts = [
  {
    id: 1,
    title: "تعريف بالامة الامازيغية واصلها",
    content:
      "تجمع الأُمة الأمازيغية المُتحدة في شمال افريقيا والعالم ... هو تجمع تاريخي وحضاري وثقافي وتعليمي متنوع ... يُعرف بتاريخ وحضارة وثقافة الأُمة الأمازيغية المُتحدة في الماضي والحاضر",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منشور",
    subcategory: "nation",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
  {
    id: 2,
    title: "الحضارة الأمازيغية عبر التاريخ",
    content: "استكشاف للإنجازات الحضارية العظيمة للشعب الأمازيغي عبر العصور المختلفة",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منشور",
    subcategory: "civilization",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
  },
  {
    id: 3,
    title: "التراث الشعبي الأمازيغي",
    content: "نظرة على التراث الغني والمتنوع للشعب الأمازيغي من فنون وحرف وتقاليد",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منشور",
    subcategory: "art",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 180, likes: 890, comments: 67, shares: 8 },
  },
  {
    id: 4,
    title: "اللغة الأمازيغية ولهجاتها المتنوعة",
    content: "دراسة شاملة للهجات الأمازيغية المختلفة عبر شمال أفريقيا",
    author: "د. أمازيغ اللغوي",
    timestamp: "نشر بتاريخ 02-04-2023 الساعة 10:20 صباحاً",
    category: "منشور",
    subcategory: "language",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 420, likes: 1350, comments: 95, shares: 22 },
  },
  {
    id: 5,
    title: "شخصيات أمازيغية مؤثرة في التاريخ",
    content: "تعرف على أهم الشخصيات الأمازيغية التي أثرت في مجرى التاريخ",
    author: "مؤرخ أمازيغي",
    timestamp: "نشر بتاريخ 03-04-2023 الساعة 15:45 مساء",
    category: "منشور",
    subcategory: "personalities",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 380, likes: 1150, comments: 78, shares: 18 },
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let filteredPosts = [...allPosts]

  // Filter by category
  if (category && category !== "all") {
    filteredPosts = filteredPosts.filter((post) => post.subcategory === category)
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm),
    )
  }

  return NextResponse.json(filteredPosts)
}
