import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) throw new Error("Missing userId")

    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: { friend: true },
    })

    const friends = friendships.map(f => ({
      id: f.friend.id,
      name: `${f.friend.firstName} ${f.friend.lastName}`.trim(),
      location: f.friend.location,
      occupation: f.friend.occupation,
      avatar: f.friend.avatar || "/placeholder.svg?height=50&width=50",
      isOnline: false, // You can implement online status later
      mutualFriends: 0, // You can implement mutual friends count later
    }))

    return NextResponse.json({ friends })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
}
