import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // استخراج معلمات الفئة والكلمة المفتاحية من رابط الطلب
    const { searchParams } = new URL(req.url)
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    
    // استخراج معلمات الترقيم
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 5 // حجم الصفحة ثابت = 5
    const skip = (page - 1) * limit

    // بناء شرط الفلترة
    const whereClause: any = {}
    if (categoryParam && categoryParam !== 'all') {
      whereClause.category = categoryParam
    }

    if (searchParam) {
      whereClause.OR = [
        { title: { contains: searchParam, mode: 'insensitive' } },
        { description: { contains: searchParam, mode: 'insensitive' } },
        { tags: { has: searchParam } },
      ]
    }

    // الحصول على العدد الإجمالي للصور
    const totalImages = await prisma.image.count({
      where: whereClause,
    })

    // جلب الصور من قاعدة البيانات مع الترقيم
    const images = await prisma.image.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        image: true,
        location: true,
        resolution: true,
        tags: true,
        timestamp: true,
        views: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          }
        }
      }
    })

    // تعريف نوع العنصر في مصفوفة الصور
    type ImageType = {
      id: string;
      title: string;
      description: string;
      category: string;
      image: string;
      location: string;
      resolution: string;
      tags: string[];
      timestamp: Date;
      views: number;
      author: {
        firstName: string;
        lastName: string;
      };
      _count: {
        likes: number;
        comments: number;
        shares: number;
      };
    };

    // إعداد الاستجابة بالشكل المناسب
    const result = images.map((img: ImageType) => ({
      id: img.id,
      title: img.title,
      description: img.description,
      author: `${img.author.firstName} ${img.author.lastName}`,
      timestamp: img.timestamp.toISOString(),
      category: img.category,
      image: img.image,
      stats: {
        views: img.views,
        likes: img._count.likes,
        comments: img._count.comments,
        shares: img._count.shares,
      },
      location: img.location,
      resolution: img.resolution,
      tags: img.tags,
    }))

    // حساب معلومات الترقيم
    const totalPages = Math.ceil(totalImages / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      data: result,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalImages,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      }
    })
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}