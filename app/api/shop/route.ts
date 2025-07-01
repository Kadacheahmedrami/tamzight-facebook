import { NextResponse } from "next/server"

export async function GET() {
  const products = [
    {
      id: 1,
      title: "فستان امازيغي تقليدي مطرز يدوياً",
      content: "فستان امازيغي تقليدي مصنوع يدوياً بخيوط الحرير والقطن الطبيعي",
      author: "متجر التراث الأمازيغي",
      timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
      category: "ملابس تقليدية",
      image: "/placeholder.svg?height=300&width=600",
      stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
      price: "1200",
      currency: "درهم",
      inStock: true,
      sizes: ["S", "M", "L", "XL"],
      colors: ["أحمر", "أزرق", "أخضر"],
    },
    {
      id: 2,
      title: "سجاد امازيغي منسوج يدوياً",
      content: "سجاد امازيغي أصيل مصنوع من الصوف الطبيعي بنقوش تقليدية",
      author: "تعاونية النساء الحرفيات",
      timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
      category: "مفروشات",
      image: "/placeholder.svg?height=300&width=600",
      stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
      price: "2500",
      currency: "درهم",
      inStock: true,
      dimensions: "200x150 سم",
      material: "صوف طبيعي 100%",
    },
    {
      id: 3,
      title: "مجوهرات امازيغية فضية",
      content: "مجموعة من المجوهرات الأمازيغية التقليدية المصنوعة من الفضة الخالصة",
      author: "صائغ التراث",
      timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
      category: "مجوهرات",
      image: "/placeholder.svg?height=300&width=600",
      stats: { views: 180, likes: 890, comments: 67, shares: 8 },
      price: "800",
      currency: "درهم",
      inStock: true,
      material: "فضة 925",
      weight: "25 جرام",
    },
  ]

  return NextResponse.json(products)
}
