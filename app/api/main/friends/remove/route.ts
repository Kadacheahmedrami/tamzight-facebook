import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { userId, friendId } = await request.json()
    if (!userId || !friendId) throw new Error("Missing userId or friendId")
    if (userId === friendId) throw new Error("Cannot unfriend yourself")

    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
} 