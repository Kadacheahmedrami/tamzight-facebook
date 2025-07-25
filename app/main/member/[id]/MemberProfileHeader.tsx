// app/main/member/[id]/MemberProfileHeader.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Briefcase, MessageCircle, UserPlus, UserMinus, UserCheck, Clock, Save, X, Camera, Edit3, Loader2 } from "lucide-react"

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

interface MemberProfileHeaderProps {
  memberData: MemberData
  memberId: string
  isAuthenticated: boolean
  onMemberDataUpdate: (updatedData: MemberData) => void
}

interface EditFormData {
  firstName: string
  lastName: string
  bio: string
  location: string
  occupation: string
  avatar: string
  coverImage: string
}

export default function MemberProfileHeader({ 
  memberData, 
  memberId, 
  isAuthenticated, 
  onMemberDataUpdate 
}: MemberProfileHeaderProps) {
  const router = useRouter()
  const [friendshipLoading, setFriendshipLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    bio: memberData.bio || '',
    location: memberData.location || '',
    occupation: memberData.occupation || '',
    avatar: memberData.avatar || '',
    coverImage: memberData.coverImage || ''
  })

  const handleMessageClick = async () => {
    if (!isAuthenticated || messageLoading) return
    
    setMessageLoading(true)
    
    try {
      // First, try to get existing chat messages to see if conversation exists
      const response = await fetch(`/api/main/chats/${memberId}`)
      
      if (response.ok) {
        // Chat exists or can be created, redirect to chat page
        router.push(`/main/chats/${memberId}`)
      } else if (response.status === 404) {
        // User not found
        alert('المستخدم غير موجود')
      } else if (response.status === 400) {
        // Cannot chat with yourself
        alert('لا يمكنك إرسال رسالة لنفسك')
      } else if (response.status === 401) {
        // Not authenticated
        alert('يجب تسجيل الدخول أولاً')
      } else {
        // Other error
        console.error('Error accessing chat:', await response.text())
        alert('حدث خطأ أثناء فتح المحادثة')
      }
    } catch (error) {
      console.error('Error opening chat:', error)
      alert('حدث خطأ أثناء فتح المحادثة')
    } finally {
      setMessageLoading(false)
    }
  }

  const handleFriendshipAction = async (action: 'send' | 'accept' | 'remove' | 'cancel') => {
    if (!isAuthenticated || friendshipLoading) return
    setFriendshipLoading(true)
    
    try {
      const response = await fetch(`/api/main/member/${memberId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        onMemberDataUpdate({
          ...memberData,
          friendshipStatus: result.friendshipStatus
        })
      } else {
        console.error("Friendship action error:", result.error)
        alert(result.error || 'حدث خطأ أثناء تنفيذ العملية')
      }
    } catch (error) {
      console.error("Error handling friendship action:", error)
      alert('حدث خطأ أثناء تنفيذ العملية')
    } finally {
      setFriendshipLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || editLoading) return
    
    setEditLoading(true)
    
    try {
      const response = await fetch(`/api/main/member/${memberId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        const updatedMemberData = { ...memberData, ...result.user }
        onMemberDataUpdate(updatedMemberData)
        setEditDialogOpen(false)
      } else {
        console.error("Edit profile error:", result.error)
        alert(result.error || 'حدث خطأ أثناء تحديث الملف الشخصي')
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert('حدث خطأ أثناء تحديث الملف الشخصي')
    } finally {
      setEditLoading(false)
    }
  }

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetEditForm = () => {
    setEditFormData({
      firstName: memberData.firstName,
      lastName: memberData.lastName,
      bio: memberData.bio || '',
      location: memberData.location || '',
      occupation: memberData.occupation || '',
      avatar: memberData.avatar || '',
      coverImage: memberData.coverImage || ''
    })
  }

  const renderFriendshipButton = () => {
    if (!isAuthenticated || memberData.isOwnProfile) return null
    
    const { friendshipStatus } = memberData

    switch (friendshipStatus) {
      case 'none':
        return (
          <Button 
            onClick={() => handleFriendshipAction('send')} 
            disabled={friendshipLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
          >
            {friendshipLoading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 ml-2" />
            )}
            {friendshipLoading ? 'جاري الإرسال...' : 'إضافة صديق'}
          </Button>
        )

      case 'pending_sent':
        return (
          <Button 
            onClick={() => handleFriendshipAction('cancel')} 
            disabled={friendshipLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            {friendshipLoading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 ml-2" />
            )}
            {friendshipLoading ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
          </Button>
        )

      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleFriendshipAction('accept')} 
              disabled={friendshipLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
            >
              {friendshipLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4 ml-2" />
              )}
              {friendshipLoading ? 'جاري القبول...' : 'قبول'}
            </Button>
            <Button 
              onClick={() => handleFriendshipAction('cancel')} 
              disabled={friendshipLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              {friendshipLoading ? 'جاري الرفض...' : 'رفض'}
            </Button>
          </div>
        )

      case 'friends':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={handleMessageClick}
              disabled={messageLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
            >
              {messageLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 ml-2" />
              )}
              {messageLoading ? 'جاري الفتح...' : 'رسالة'}
            </Button>
            <Button 
              onClick={() => handleFriendshipAction('remove')} 
              disabled={friendshipLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              {friendshipLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4 ml-2" />
              )}
              {friendshipLoading ? 'جاري الإلغاء...' : 'إلغاء الصداقة'}
            </Button>
          </div>
        )

      default: return null
    }
  }

  // Show message button for non-friends too (optional - remove if you only want friends to message)
  const renderMessageButton = () => {
    if (!isAuthenticated || memberData.isOwnProfile) return null
    
    // If not friends, show a separate message button
    if (memberData.friendshipStatus !== 'friends') {
      return (
        <Button 
          onClick={handleMessageClick}
          disabled={messageLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm"
        >
          {messageLoading ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <MessageCircle className="w-4 h-4 ml-2" />
          )}
          {messageLoading ? 'جاري الفتح...' : 'إرسال رسالة'}
        </Button>
      )
    }
    return null
  }

  const fullName = `${memberData.firstName} ${memberData.lastName}`
  const totalFriends = memberData._count.friendships + memberData._count.friendOf

  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* Cover Photo Section */}
      <div className="relative">
        <div className="h-48 md:h-56 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-b-2xl overflow-hidden">
          {memberData.coverImage ? (
            <img 
              src={memberData.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
          )}
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 right-6 md:right-8">
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl">
              <AvatarImage src={memberData.avatar} alt={fullName} />
              <AvatarFallback className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {memberData.firstName[0]}{memberData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {memberData.isOwnProfile && (
              <Button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-white shadow-lg p-0">
                <Camera className="w-4 h-4 text-gray-800" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="pt-20 px-6 md:px-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 ">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{fullName}</h1>
            {memberData.bio && (
              <p className="text-gray-600 text-lg leading-relaxed mb-4 max-w-2xl">{memberData.bio}</p>
            )}
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-gray-500 mb-4">
              {memberData.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {memberData.location}
                </span>
              )}
              {memberData.occupation && (
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {memberData.occupation}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                عضو منذ {new Date(memberData.joinDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
              </span>
            </div>

            {/* Badges */}
            {memberData.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {memberData.badges.map(({ badge }) => (
                  <Badge 
                    key={badge.id} 
                    style={{ backgroundColor: badge.color }} 
                    className="text-white px-3 py-1 text-sm font-medium rounded-full shadow-sm" 
                    title={badge.description}
                  >
                    {badge.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {renderFriendshipButton()}
          {renderMessageButton()}
          {memberData.isOwnProfile && (
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetEditForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4 ml-2" />
                  تعديل الملف الشخصي
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">تعديل الملف الشخصي</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                      <Input
                        value={editFormData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
                      <Input
                        value={editFormData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">النبذة الشخصية</label>
                    <Textarea
                      value={editFormData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="اكتب نبذة عن نفسك..."
                      rows={3}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
                      <Input
                        value={editFormData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="المدينة، البلد"
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المهنة</label>
                      <Input
                        value={editFormData.occupation}
                        onChange={(e) => handleInputChange('occupation', e.target.value)}
                        placeholder="مهنتك أو تخصصك"
                        className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة الشخصية</label>
                    <Input
                      value={editFormData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      type="url"
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط صورة الغلاف</label>
                    <Input
                      value={editFormData.coverImage}
                      onChange={(e) => handleInputChange('coverImage', e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      type="url"
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      onClick={() => setEditDialogOpen(false)}
                      disabled={editLoading}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium"
                    >
                      <X className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={editLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm"
                    >
                      {editLoading ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 ml-2" />
                      )}
                      {editLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{memberData._count.posts}</div>
            <div className="text-sm text-gray-500">المنشورات</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalFriends}</div>
            <div className="text-sm text-gray-500">الأصدقاء</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{memberData._count.books}</div>
            <div className="text-sm text-gray-500">الكتب</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{memberData._count.ideas}</div>
            <div className="text-sm text-gray-500">الأفكار</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{memberData._count.likes}</div>
            <div className="text-sm text-gray-500">الإعجابات</div>
          </div>
        </div>
      </div>
    </div>
  )
}