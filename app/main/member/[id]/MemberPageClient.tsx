// app/main/member/[id]/MemberPageClient.tsx
"use client"
import { useState } from "react"
import MemberProfileHeader from "./MemberProfileHeader"
import MemberContentTabs from "./MemberContentTabs"

interface MemberData {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  coverImage?: string
  bio?: string
  location?: string
  occupation?: string
  joinDate: string
  _count: { posts: number; friendships: number; friendOf: number; likes: number; books: number; ideas: number }
  badges: Array<{ badge: { id: string; name: string; color: string; description?: string } }>
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  isOwnProfile: boolean
}

interface MemberPageClientProps {
  memberId: string
  initialMemberData: MemberData
  currentUserId?: string
  isAuthenticated: boolean
}

export default function MemberPageClient({ 
  memberId, 
  initialMemberData, 
  currentUserId, 
  isAuthenticated 
}: MemberPageClientProps) {
  const [memberData, setMemberData] = useState<MemberData>(initialMemberData)

  const handleMemberDataUpdate = (updatedData: MemberData) => {
    setMemberData(updatedData)
  }

  return (
    <div className="space-y-6">
      <MemberProfileHeader 
        memberData={memberData}
        memberId={memberId}
        isAuthenticated={isAuthenticated}
        onMemberDataUpdate={handleMemberDataUpdate}
      />
      
      <MemberContentTabs 
        memberData={memberData}
        memberId={memberId}
      />
    </div>
  )
}