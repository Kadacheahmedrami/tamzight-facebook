// app/main/member/[id]/MemberContentTabs.tsx
"use client"
import { useState, useEffect } from "react"
import PostCard from "@/components/LatestSactionCards/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Heart, MessageSquare } from "lucide-react"

interface MemberData {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  _count: { posts: number; friendships: number; friendOf: number; likes: number; books: number; ideas: number }
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'friends'
  isOwnProfile: boolean
}

interface ContentItem {
  id: string
  title: string
  content: string
  timestamp?: string
  createdAt?: string
  category: string
  image?: string
  type?: string
  _count: { likes: number; comments: number; shares: number }
  views: number
  shareId?: string
  sharedAt?: string
  isShared?: boolean
  author?: { firstName: string; lastName: string; avatar?: string }
}

interface InteractionItem {
  id: string
  type: 'like' | 'comment'
  timestamp: string
  content?: string
  targetContent?: { id: string; title: string; author: { firstName: string; lastName: string } }
}

interface FriendItem {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  location?: string
  occupation?: string
  friendsSince: string
}

interface MemberContentTabsProps {
  memberData: MemberData
  memberId: string
}

export default function MemberContentTabs({ memberData, memberId }: MemberContentTabsProps) {
  const [activeTab, setActiveTab] = useState("posts")
  const [contentData, setContentData] = useState<ContentItem[]>([])
  const [interactionData, setInteractionData] = useState<InteractionItem[]>([])
  const [friendsData, setFriendsData] = useState<FriendItem[]>([])
  const [contentLoading, setContentLoading] = useState(false)

  useEffect(() => {
    fetchContentData(activeTab)
  }, [activeTab])

  const fetchContentData = async (contentType: string) => {
    try {
      setContentLoading(true)
      const response = await fetch(`/api/main/member/${memberId}/content?type=${contentType}`)
      
      if (response.ok) {
        const data = await response.json()
        if (contentType === 'interactions') setInteractionData(data)
        else if (contentType === 'friends') setFriendsData(data)
        else setContentData(data)
      } else {
        if (contentType === 'interactions') setInteractionData([])
        else if (contentType === 'friends') setFriendsData([])
        else setContentData([])
      }
    } catch (error) {
      console.error("Error fetching content data:", error)
    } finally {
      setContentLoading(false)
    }
  }

  const fullName = `${memberData.firstName} ${memberData.lastName}`
  const totalFriends = memberData._count.friendships + memberData._count.friendOf
  
  const createAuthorData = () => ({
    id: parseInt(memberData.id, 10),
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    avatar: memberData.avatar
  })

  const getContentType = (contentType: string) => {
    const types: { [key: string]: string } = {
      books: 'book', ideas: 'idea', images: 'image', videos: 'video',
      truths: 'truth', questions: 'question', ads: 'ad', products: 'product'
    }
    return types[contentType] || 'post'
  }

  const formatTimestamp = (timestamp?: string, createdAt?: string) => {
    const date = timestamp || createdAt
    return date ? new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : ''
  }

  const renderContent = () => {
    if (contentLoading) return <ContentLoadingSkeleton />
    
    if (activeTab === 'interactions') {
      return interactionData.length === 0 ? (
        <EmptyState icon="❤️" title="تفاعلات العضو" description="لا توجد تفاعلات حديثة" />
      ) : (
        <div className="space-y-4">
          {interactionData.map((interaction) => (
            <div key={interaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  interaction.type === 'like' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {interaction.type === 'like' ? 
                    <Heart className="w-4 h-4 text-red-600" /> : 
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    {interaction.type === 'like' ? 
                      `أعجب بـ "${interaction.targetContent?.title}"` : 
                      `علق على "${interaction.targetContent?.title}"`
                    }
                  </div>
                  {interaction.content && <div className="text-gray-800 mb-2">{interaction.content}</div>}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTimestamp(interaction.timestamp)}</span>
                    {interaction.targetContent?.author && (
                      <>
                        <span>•</span>
                        <span>بواسطة {interaction.targetContent.author.firstName} {interaction.targetContent.author.lastName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'friends') {
      return friendsData.length === 0 ? (
        <EmptyState icon="👥" title="أصدقاء العضو" 
                   description={memberData.isOwnProfile ? "قائمة أصدقائك فارغة" : "قائمة الأصدقاء"} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendsData.map((friend) => (
            <div key={friend.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={friend.avatar} alt={`${friend.firstName} ${friend.lastName}`} />
                  <AvatarFallback>{friend.firstName[0]}{friend.lastName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{friend.firstName} {friend.lastName}</h3>
                  {friend.occupation && <p className="text-sm text-gray-600">{friend.occupation}</p>}
                  {friend.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{friend.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">أصدقاء منذ {formatTimestamp(friend.friendsSince)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Regular content
    if (contentData.length === 0) {
      const contentNames: { [key: string]: string } = {
        posts: 'منشورات', books: 'كتب', ideas: 'أفكار', images: 'صور', videos: 'فيديوهات',
        truths: 'حقائق', questions: 'أسئلة', ads: 'إعلانات', products: 'منتجات', shares: 'مشاركات'
      }
      const icons: { [key: string]: string } = {
        posts: '📝', books: '📚', ideas: '💡', images: '🖼️', videos: '🎥',
        truths: '✨', questions: '❓', ads: '📢', products: '🛍️', shares: '📤'
      }
      
      return (
        <EmptyState 
          icon={icons[activeTab] || '📄'}
          title={`${contentNames[activeTab] || 'محتوى'} العضو`}
          description={memberData.isOwnProfile 
            ? `لم تنشر أي ${contentNames[activeTab] || 'محتوى'} بعد` 
            : `لم ينشر هذا العضو أي ${contentNames[activeTab] || 'محتوى'} بعد`
          }
        />
      )
    }

    return (
      <div className="space-y-4 lg:space-y-6">
        {contentData.map((item) => (
          <PostCard 
            key={item.id} 
            id={item.id} 
            title={item.title} 
            content={item.content}
            author={item.isShared && item.author ? `${item.author.firstName} ${item.author.lastName}` : fullName}
            authorId={parseInt(memberData.id, 10)}
            authorData={item.isShared && item.author ? {
              id: parseInt(memberData.id, 10),
              firstName: item.author.firstName,
              lastName: item.author.lastName,
              avatar: item.author.avatar
            } : createAuthorData()}
            timestamp={formatTimestamp(item.timestamp, item.createdAt)}
            category={item.category} 
            type={item.type || getContentType(activeTab)}
            image={item.image} 
            baseRoute="/main"
            stats={{ 
              views: item.views, 
              likes: item._count.likes, 
              comments: item._count.comments, 
              shares: item._count.shares 
            }}
            {...(item.sharedAt && { sharedAt: formatTimestamp(item.sharedAt) })}
          />
        ))}
      </div>
    )
  }

  const tabs = [
    { value: 'posts', label: `منشوراته (${memberData._count.posts})` },
    { value: 'shares', label: 'مشاركاته' },
    { value: 'interactions', label: 'تفاعلاته' },
    { value: 'books', label: 'كتبه' },
    { value: 'ideas', label: 'أفكاره' },
    { value: 'images', label: 'صوره' },
    { value: 'videos', label: 'فيديوهاته' },
    { value: 'truths', label: 'حقائقه' },
    { value: 'questions', label: 'أسئلته' },
    { value: 'ads', label: 'إعلاناته' },
    { value: 'products', label: 'منتجاته' },
    ...(memberData.isOwnProfile || memberData.friendshipStatus === 'friends' ? 
       [{ value: 'friends', label: `أصدقاءه (${totalFriends})` }] : [])
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} 
                          className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">
                {tab.label}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4 lg:mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContentLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-32"></div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}