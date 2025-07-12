import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Helper to build a search filter for Prisma
function buildSearchFilter(query: string, fields: string[]) {
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: query,
        mode: "insensitive",
      },
    })),
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ suggestions: [], results: [] })
  }

  // Run all searches in parallel, each with explicit model
  const [
    posts,
    books,
    questions,
    truths,
    images,
    videos,
    ideas,
  ] = await Promise.all([
    prisma.post.findMany({
      where: buildSearchFilter(query, ["title", "content"]),
      select: {
        id: true,
        title: true,
        content: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.findMany({
      where: buildSearchFilter(query, ["title", "content"]),
      select: {
        id: true,
        title: true,
        content: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.findMany({
      where: buildSearchFilter(query, ["title", "content"]),
      select: {
        id: true,
        title: true,
        content: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.truth.findMany({
      where: buildSearchFilter(query, ["title", "content"]),
      select: {
        id: true,
        title: true,
        content: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.image.findMany({
      where: buildSearchFilter(query, ["title", "description"]),
      select: {
        id: true,
        title: true,
        description: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.video.findMany({
      where: buildSearchFilter(query, ["title", "content"]),
      select: {
        id: true,
        title: true,
        content: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.idea.findMany({
      where: buildSearchFilter(query, ["title", "content"]),
      select: {
        id: true,
        title: true,
        content: true,
        author: { select: { firstName: true, lastName: true } },
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ])

  // Map and normalize all results
  const allResults = [
    ...posts.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "منشور",
      url: `/posts/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...books.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "كتاب",
      url: `/books/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...questions.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "سؤال",
      url: `/questions/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...truths.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "حقيقة",
      url: `/truth/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...images.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.description || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "صورة",
      url: `/images/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...videos.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "فيديو",
      url: `/videos/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...ideas.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "فكرة",
      url: `/ideas/${item.id}`,
      createdAt: item.createdAt,
    })),
  ]

  // Sort by recency
  allResults.sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any))

  // Suggestions: first 5, Results: next 10
  const suggestions = allResults.slice(0, 5)
  const results = allResults.slice(5, 15)

  return NextResponse.json({ suggestions, results })
}
