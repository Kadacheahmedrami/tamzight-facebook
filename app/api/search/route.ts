import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"  // singleton PrismaClient
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const pageSize = 10
    const skip = (page - 1) * pageSize

    if (!query) {
      return NextResponse.json({ data: [], total: 0 }, { status: 200 })
    }

    const searchTerm = query

    // Build typed filter
    const where: Prisma.UserWhereInput = {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName:  { contains: searchTerm, mode: 'insensitive' } },
        { email:     { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Fetch matching users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    const result = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      joined: user.createdAt.toISOString()
    }))

    return NextResponse.json({ data: result, total }, {
      status: 200,
      headers: {
        'X-Total-Count': total.toString(),
        'X-Page': page.toString(),
        'X-Page-Size': pageSize.toString(),
        'Cache-Control': 'public, max-age=60'
      }
    })
  } catch (error) {
    console.error('[User Search API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
