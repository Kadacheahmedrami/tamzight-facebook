import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const allImages = [
  {
    id: 1,
    title: "صور تراثية امازيغية من الأطلس",
    description: "مجموعة من الصور التراثية الأمازيغية من منطقة الأطلس الكبير",
    category: "heritage",
    image: "/placeholder.svg?height=300&width=400",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023",
    location: "الأطلس الكبير",
    resolution: "1920x1080",
    tags: ["تراث", "أطلس", "تقليدي"],
  },
  {
    id: 2,
    title: "ملابس امازيغية تقليدية للنساء",
    description: "صور للملابس التقليدية الأمازيغية للنساء بألوانها الزاهية",
    category: "clothing",
    image: "/placeholder.svg?height=300&width=400",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023",
    location: "سوس",
    resolution: "1920x1080",
    tags: ["ملابس", "نساء", "تقليدي", "ألوان"],
  },
  {
    id: 3,
    title: "مناظر طبيعية من الصحراء الأمازيغية",
    description: "صور خلابة للمناظر الطبيعية في المناطق الأمازيغية الصحراوية",
    category: "nature",
    image: "/placeholder.svg?height=300&width=400",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023",
    location: "الصحراء الكبرى",
    resolution: "4K",
    tags: ["طبيعة", "صحراء", "مناظر"],
  },
  {
    id: 4,
    title: "فنون امازيغية تقليدية",
    description: "صور للفنون والحرف الأمازيغية التقليدية والنقوش القديمة",
    category: "art",
    image: "/placeholder.svg?height=300&width=400",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023",
    location: "تافراوت",
    resolution: "1920x1080",
    tags: ["فنون", "حرف", "نقوش", "تقليدي"],
  },
  {
    id: 5,
    title: "طعام امازيغي تقليدي",
    description: "صور للأطباق التقليدية الأمازيغية وطرق تحضيرها",
    category: "food",
    image: "/placeholder.svg?height=300&width=400",
    author: "الشيف أمينة",
    timestamp: "نشر بتاريخ 02-04-2023",
    location: "فاس",
    resolution: "1920x1080",
    tags: ["طعام", "تقليدي", "كسكس", "طاجين"],
  },
  {
    id: 6,
    title: "عمارة امازيغية قديمة",
    description: "صور للمباني والقصور الأمازيغية التقليدية",
    category: "architecture",
    image: "/placeholder.svg?height=300&width=400",
    author: "مهندس معماري",
    timestamp: "نشر بتاريخ 03-04-2023",
    location: "آيت بن حدو",
    resolution: "4K",
    tags: ["عمارة", "قصور", "تقليدي", "طين"],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let filteredImages = [...allImages]

  // Filter by category
  if (category && category !== "all") {
    filteredImages = filteredImages.filter((image) => image.category === category)
  }

  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredImages = filteredImages.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm) ||
        image.description.toLowerCase().includes(searchTerm) ||
        image.author.toLowerCase().includes(searchTerm) ||
        image.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
    )
  }

  return NextResponse.json(filteredImages)
}
