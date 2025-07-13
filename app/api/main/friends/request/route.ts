// app/api/friends/request/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
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

    const { receiverId } = await request.json()
    if (!receiverId) throw new Error("Missing receiverId")
    
    const senderId = user.id
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