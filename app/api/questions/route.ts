import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allQuestions = [
  {
    id: 1,
    title: "في أي سنة تم ذكر الامازيغ في تاريخ البشرية؟",
    content: "سؤال مهم حول أول ذكر تاريخي للشعب الأمازيغي في المصادر التاريخية القديمة",
    author: "سيبتموس سيفوروس",
    timestamp: "طرح سؤال بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "سؤال",
    type: "answer",
    answered: false,
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
  {
    id: 2,
    title: "ما هو اصل الامازيغ الحقيقي؟",
    content: "استفسار حول الأصول الجغرافية والعرقية للشعب الأمازيغي",
    author: "سيبتموس سيفوروس",
    timestamp: "طرح سؤال بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "سؤال",
    type: "vote",
    answered: true,
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
  },
  {
    id: 3,
    title: "كيف انتشرت اللغة الأمازيغية عبر شمال أفريقيا؟",
    content: "سؤال حول تاريخ انتشار اللغة الأمازيغية وتطورها عبر المناطق المختلفة",
    author: "سيبتموس سيفوروس",
    timestamp: "طرح سؤال بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "سؤال",
    type: "answer",
    answered: false,
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 180, likes: 890, comments: 67, shares: 8 },
  },
  {
    id: 4,
    title: "ما هي أهم المعالم الأثرية الأمازيغية؟",
    content: "سؤال حول المعالم والمواقع الأثرية المهمة في التاريخ الأمازيغي",
    author: "باحث أثري",
    timestamp: "طرح سؤال بتاريخ 02-04-2023 الساعة 14:20 مساء",
    category: "سؤال",
    type: "vote",
    answered: true,
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 290, likes: 950, comments: 45, shares: 12 },
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const search = searchParams.get("search")

  let filteredQuestions = [...allQuestions]

  // Filter by type
  if (type && type !== "all") {
    if (type === "answer") {
      filteredQuestions = filteredQuestions.filter((q) => !q.answered)
    } else if (type === "vote") {
      filteredQuestions = filteredQuestions.filter((q) => q.answered)
    }
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredQuestions = filteredQuestions.filter(
      (question) =>
        question.title.toLowerCase().includes(searchTerm) ||
        question.content.toLowerCase().includes(searchTerm) ||
        question.author.toLowerCase().includes(searchTerm),
    )
  }

  return NextResponse.json(filteredQuestions)
}
