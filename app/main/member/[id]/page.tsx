// app/main/member/[id]/page.tsx (Server Component)
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import MemberPageClient from "./MemberPageClient"

// Define the server-side member data type that matches Prisma output
interface ServerMemberData {
  id: string
  firstName: string
  lastName: string
  avatar: string | null
  coverImage: string | null
  bio: string | null
  location: string | null
  occupation: string | null
  joinDate: Date
  email: string
  _count: {
    posts: number
    friendships: number
    friendOf: number
    likes: number
    comments: number
    books: number
    ideas: number
  }
  badges: Array<{
    badge: {
      id: string
      name: string
      color: string
      description: string | null
    }
  }>
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  isOwnProfile: boolean
}

// Helper function to determine friendship status (same as API route)
async function getFriendshipStatus(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) {
    return 'none'
  }

  // Check for existing friendship first
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: currentUserId, friendId: targetUserId },
        { userId: targetUserId, friendId: currentUserId }
      ]
    }
  })

  if (friendship) {
    return 'friends'
  }

  // Check for pending friend requests
  const sentRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: currentUserId,
      receiverId: targetUserId,
      status: 'pending'
    }
  })

  if (sentRequest) {
    return 'pending_sent'
  }

  const receivedRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: targetUserId,
      receiverId: currentUserId,
      status: 'pending'
    }
  })

  if (receivedRequest) {
    return 'pending_received'
  }

  return 'none'
}

async function fetchMemberData(memberId: string, currentUserId?: string): Promise<ServerMemberData | null> {
  try {
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        coverImage: true,
        bio: true,
        location: true,
        occupation: true,
        joinDate: true,
        email: true,
        _count: {
          select: {
            posts: true,
            friendships: true,
            friendOf: true,
            likes: true,
            comments: true,
            books: true,
            ideas: true,
          }
        },
        badges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              }
            }
          }
        }
      }
    })

    if (!member) {
      return null
    }

    const isOwnProfile = currentUserId === memberId
    
    // Get friendship status using the same helper function as API
    const friendshipStatus = currentUserId ? 
      await getFriendshipStatus(currentUserId, memberId) : 'none'

    return {
      ...member,
      joinDate: member.joinDate, // Keep as Date object
      friendshipStatus,
      isOwnProfile
    }

  } catch (error) {
    console.error("Error fetching member data:", error)
    return null
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MemberPage({ params }: PageProps) {
  const { id: memberId } = await params
  const session = await getServerSession(authOptions)
  
  const initialMemberData = await fetchMemberData(memberId, (session?.user as any)?.id)
  
  if (!initialMemberData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            العضو غير موجود
          </h2>
          <p className="text-gray-600">
            تأكد من صحة الرابط أو حاول مرة أخرى
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
     <MemberPageClient 
      session={session}
      memberId={memberId}
      initialMemberData={{
        ...initialMemberData,
        // Convert Date to string and null to undefined to match client interface
        joinDate: initialMemberData.joinDate.toISOString(),
        avatar: initialMemberData.avatar ?? undefined,
        coverImage: initialMemberData.coverImage ?? undefined,
        bio: initialMemberData.bio ?? undefined,
        location: initialMemberData.location ?? undefined,
        occupation: initialMemberData.occupation ?? undefined,
        badges: initialMemberData.badges.map(userBadge => ({
          badge: {
            ...userBadge.badge,
            description: userBadge.badge.description ?? undefined
          }
        }))
      }}
      currentUserId={(session?.user as any)?.id}
      isAuthenticated={!!session}
    />
    </>
   
  )
}