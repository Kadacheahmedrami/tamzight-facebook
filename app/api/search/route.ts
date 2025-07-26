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

  // Run all searches in parallel, including users
  const [
    users,
    posts,
    books,
    questions,
    truths,
    images,
    videos,
    ideas,
    ads,
    products,
  ] = await Promise.all([
    // Search users by firstName, lastName, and email
    prisma.user.findMany({
      where: buildSearchFilter(query, ["firstName", "lastName", "email"]),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        image: true,
        bio: true,
        occupation: true,
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
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
    prisma.ad.findMany({
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
    prisma.product.findMany({
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

  // Map and normalize all results with proper main/ routing
  const allResults = [
    // Users mapping
    ...users.map((item) => ({
      id: item.id,
      title: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email,
      content: item.bio || item.occupation || `المستخدم: ${item.email}`,
      author: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "مستخدم",
      type: "مستخدم",
      url: `/main/member/${item.id}`,
      avatar: item.avatar || item.image,
      createdAt: item.createdAt,
    })),
    ...posts.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "منشور",
      url: `/main/posts/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...books.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "كتاب",
      url: `/main/books/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...questions.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "سؤال",
      url: `/main/questions/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...truths.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "حقيقة",
      url: `/main/truths/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...images.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.description || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "صورة",
      url: `/main/images/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...videos.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "فيديو",
      url: `/main/videos/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...ideas.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "فكرة",
      url: `/main/ideas/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...ads.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "إعلان",
      url: `/main/ads/${item.id}`,
      createdAt: item.createdAt,
    })),
    ...products.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content || "",
      author: item.author ? `${item.author.firstName || ""} ${item.author.lastName || ""}`.trim() : "",
      type: "منتج",
      url: `/main/products/${item.id}`,
      createdAt: item.createdAt,
    })),
  ]

  // Sort by recency
  allResults.sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any))

  // Return all results (no more separation between suggestions and results)
  return NextResponse.json(allResults.slice(0, 20)) // Return top 20 results
}