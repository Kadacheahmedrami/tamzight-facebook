import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Fake user database - same as in other auth files
const FAKE_USERS = [
  {
    id: 1,
    email: "admin@tamazight.com",
    password: "123456",
    firstName: "سيبتموس",
    lastName: "سيفوروس",
    role: "admin",
  },
  {
    id: 2,
    email: "user@tamazight.com",
    password: "123456",
    firstName: "تايري",
    lastName: "الامازيغية",
    role: "user",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    // const token = request.cookies.get("auth_token")?.value

    // if (!token || !token.startsWith("fake_jwt_")) {
    //   return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 })
    // }

    // // Extract user ID from fake token
    // const userId = Number.parseInt(token.split("_")[2])
    const user = FAKE_USERS[0]

    // if (!user) {
    //   return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 })
    // }

    // Return user data (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
