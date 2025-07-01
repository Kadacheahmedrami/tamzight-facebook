import { NextResponse } from "next/server"

export async function GET() {
  const ideas = [
    {
      id: 1,
      title: "اضافة قسم جديد للشعر الأمازيغي",
      content: "اقتراح باضافة قسم مخصص للشعر والأدب الأمازيغي لإثراء المحتوى الثقافي",
      author: "سيبتموس سيفوروس",
      timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
      category: "اقتراح محتوى",
      image: "/placeholder.svg?height=300&width=600",
      stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
      status: "قيد المراجعة",
      priority: "عالية",
      votes: 1605,
    },
    {
      id: 2,
      title: "تطوير تطبيق جوال للمنصة",
      content: "اقتراح لتطوير تطبيق جوال لتسهيل الوصول للمنصة وتحسين تجربة المستخدم",
      author: "مطور أمازيغي",
      timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
      category: "اقتراح تقني",
      image: "/placeholder.svg?height=300&width=600",
      stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
      status: "مقبول",
      priority: "عالية",
      votes: 1200,
    },
    {
      id: 3,
      title: "إضافة ميزة الترجمة التلقائية",
      content: "اقتراح لإضافة ميزة ترجمة تلقائية بين العربية والأمازيغية والفرنسية",
      author: "لغوي أمازيغي",
      timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
      category: "اقتراح لغوي",
      image: "/placeholder.svg?height=300&width=600",
      stats: { views: 180, likes: 890, comments: 67, shares: 8 },
      status: "قيد الدراسة",
      priority: "متوسطة",
      votes: 890,
    },
  ]

  return NextResponse.json(ideas)
}
