import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) throw new Error("Missing userId")

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