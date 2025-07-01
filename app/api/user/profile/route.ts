import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // In a real app, get user ID from authentication
  const userId = 1 // Mock user ID

  const userProfile = {
    id: userId,
    firstName: "سيبتموس",
    lastName: "سيفوروس",
    email: "admin@tamazight.com",
    location: "ليبيا",
    occupation: "مؤسس المنصة",
    bio: "مؤسس منصة تجمع الأمازيغ للتواصل الاجتماعي والثقافي",
    avatar: "/placeholder.svg?height=100&width=100",
    coverImage: "/placeholder.svg?height=300&width=800",
    joinDate: "2023-01-01",
    stats: {
      posts: 45,
      followers: 1250,
      following: 320,
      likes: 8934,
      views: 45672,
    },
    badges: [
      { name: "عضو مؤسس", color: "gold" },
      { name: "كاتب نشط", color: "blue" },
      { name: "محبوب المجتمع", color: "red" },
    ],
  }

  return NextResponse.json(userProfile)
}
