import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { senderId, receiverId } = await request.json()
    if (!senderId || !receiverId) throw new Error("Missing senderId or receiverId")
    if (senderId === receiverId) throw new Error("Cannot send friend request to yourself")

    const existing = await prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    })
    if (existing) throw new Error("Request already exists")

    const req = await prisma.friendRequest.create({
      data: { senderId, receiverId },
    })
    return NextResponse.json({ success: true, request: req })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
} 