import { NextResponse } from "next/server"

export async function GET() {
  const friends = [
    {
      id: 1,
      name: "جمال احمد",
      location: "ليبيا",
      occupation: "تاجر",
      avatar: "/placeholder.svg?height=50&width=50",
      isOnline: true,
      mutualFriends: 15,
    },
    {
      id: 2,
      name: "خالد محمد",
      location: "تونس",
      occupation: "مهندس",
      avatar: "/placeholder.svg?height=50&width=50",
      isOnline: false,
      mutualFriends: 8,
    },
    {
      id: 3,
      name: "فاطمة الزهراء",
      location: "المغرب",
      occupation: "معلمة",
      avatar: "/placeholder.svg?height=50&width=50",
      isOnline: true,
      mutualFriends: 22,
    },
    {
      id: 4,
      name: "يوسف أيت علي",
      location: "الجزائر",
      occupation: "طبيب",
      avatar: "/placeholder.svg?height=50&width=50",
      isOnline: false,
      mutualFriends: 12,
    },
  ]

  const suggestions = [
    {
      id: 5,
      name: "أمينة تامازيغت",
      location: "المغرب",
      occupation: "فنانة",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 5,
    },
    {
      id: 6,
      name: "عبد الرحمن الأمازيغي",
      location: "ليبيا",
      occupation: "كاتب",
      avatar: "/placeholder.svg?height=50&width=50",
      mutualFriends: 3,
    },
  ]

  return NextResponse.json({ friends, suggestions })
}
