// app/api/friends/pending/route.ts
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

    // Received requests
    const received = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "pending" },
      include: { sender: true },
    })
    // Sent requests
    const sent = await prisma.friendRequest.findMany({
      where: { senderId: userId, status: "pending" },
      include: { receiver: true },
    })

    return NextResponse.json({ received, sent })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
}