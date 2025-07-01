import { NextResponse } from "next/server"

export async function GET() {
  const notifications = [
    {
      id: 1,
      type: "like",
      message: "أعجب أحمد بمنشورك حول التراث الأمازيغي",
      timestamp: "منذ 5 دقائق",
      read: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      type: "comment",
      message: "علق فاطمة على منشورك في قسم اللغة الأمازيغية",
      timestamp: "منذ 15 دقيقة",
      read: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      type: "follow",
      message: "بدأ محمد في متابعتك",
      timestamp: "منذ ساعة",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 4,
      type: "share",
      message: "شارك يوسف منشورك حول الحضارة الأمازيغية",
      timestamp: "منذ ساعتين",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  return NextResponse.json(notifications)
}
