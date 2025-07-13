// app/api/friends/suggestions/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get user ID from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = user.id

    // Get all user IDs that are already friends or pending
    const friends = await prisma.friendship.findMany({ where: { userId }, select: { friendId: true } })
    const sent = await prisma.friendRequest.findMany({ where: { senderId: userId, status: "pending" }, select: { receiverId: true } })
    const received = await prisma.friendRequest.findMany({ where: { receiverId: userId, status: "pending" }, select: { senderId: true } })
    const excludeIds = [
      userId,
      ...friends.map(f => f.friendId),
      ...sent.map(r => r.receiverId),
      ...received.map(r => r.senderId),
    ]

    // Suggest users not in excludeIds
    const suggestions = await prisma.user.findMany({
      where: { id: { notIn: excludeIds } },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        location: true,
        occupation: true,
        avatar: true,
      },
    })

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
}