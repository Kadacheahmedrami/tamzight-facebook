import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Import all data from other endpoints (in a real app, this would be from a database)
const allContent = [
  // Posts
  {
    id: "post-1",
    title: "تعريف بالامة الامازيغية واصلها",
    content: "تجمع الأُمة الأمازيغية المُتحدة في شمال افريقيا والعالم",
    author: "سيبتموس سيفوروس",
    type: "منشور",
    url: "/posts",
  },
  {
    id: "post-2",
    title: "الحضارة الأمازيغية عبر التاريخ",
    content: "استكشاف للإنجازات الحضارية العظيمة للشعب الأمازيغي",
    author: "سيبتموس سيفوروس",
    type: "منشور",
    url: "/posts",
  },
  // Questions
  {
    id: "question-1",
    title: "في أي سنة تم ذكر الامازيغ في تاريخ البشرية؟",
    content: "سؤال مهم حول أول ذكر تاريخي للشعب الأمازيغي",
    author: "سيبتموس سيفوروس",
    type: "سؤال",
    url: "/questions",
  },
  // Truths
  {
    id: "truth-1",
    title: "هويتنا امازيغية افريقية",
    content: "الامازيغية هويتُنا *** الامازيغية ثقافتُنا",
    author: "سيبتموس سيفوروس",
    type: "حقيقة",
    url: "/truth",
  },
  // Books
  {
    id: "book-1",
    title: "السهل والميسر في تعلم اللغة الامازيغية",
    content: "كتاب شامل لتعليم اللغة الامازيغية",
    author: "ابوبكر هارون",
    type: "كتاب",
    url: "/books",
  },
  // Videos
  {
    id: "video-1",
    title: "تعلم الاعداد في اللغة الامازيغية",
    content: "فيديو تعليمي شامل لتعلم الاعداد",
    author: "سيبتموس سيفوروس",
    type: "فيديو",
    url: "/videos",
  },
  // Images
  {
    id: "image-1",
    title: "صور تراثية امازيغية من الأطلس",
    content: "مجموعة من الصور التراثية الأمازيغية",
    author: "سيبتموس سيفوروس",
    type: "صورة",
    url: "/images",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json([])
  }

  const searchTerm = query.toLowerCase()
  const results = allContent.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.author.toLowerCase().includes(searchTerm),
  )

  return NextResponse.json(results.slice(0, 10)) // Limit to 10 results
}
