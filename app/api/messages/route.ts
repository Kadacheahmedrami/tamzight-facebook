import { NextResponse } from "next/server"

export async function GET() {
  const messages = [
    {
      id: 1,
      sender: "أحمد الأمازيغي",
      message: "مرحبا، شكرا لك على المنشور الرائع",
      timestamp: "منذ 10 دقائق",
      read: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      sender: "فاطمة تامازيغت",
      message: "هل يمكنك مساعدتي في تعلم اللغة الأمازيغية؟",
      timestamp: "منذ 30 دقيقة",
      read: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      sender: "محمد أيت علي",
      message: "أعجبني كثيرا منشورك حول التاريخ",
      timestamp: "منذ ساعة",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  return NextResponse.json(messages)
}
