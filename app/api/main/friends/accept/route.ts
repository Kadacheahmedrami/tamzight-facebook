import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { senderId, receiverId } = await request.json()
    if (!senderId || !receiverId) throw new Error("Missing senderId or receiverId")
    if (senderId === receiverId) throw new Error("Cannot accept your own request")

    const req = await prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    })
    if (!req || req.status !== "pending") throw new Error("No pending request found")

    await prisma.friendRequest.update({
      where: { senderId_receiverId: { senderId, receiverId } },
      data: { status: "accepted" },
    })
    await prisma.friendship.createMany({
      data: [
        { userId: senderId, friendId: receiverId },
        { userId: receiverId, friendId: senderId },
      ],
      skipDuplicates: true,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
} 