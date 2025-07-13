// app/api/friends/decline/route.ts
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

    const { senderId, receiverId } = await request.json()
    if (!senderId || !receiverId) throw new Error("Missing senderId or receiverId")
    if (senderId === receiverId) throw new Error("Cannot decline your own request")
    
    // Verify the authenticated user is the receiver
    if (user.id !== receiverId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const req = await prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } },
    })
    if (!req || req.status !== "pending") throw new Error("No pending request found")

    await prisma.friendRequest.update({
      where: { senderId_receiverId: { senderId, receiverId } },
      data: { status: "rejected" },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 })
  }
}