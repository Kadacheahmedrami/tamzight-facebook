import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Fake user database - replace with real database later
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, remember } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    // Simulate database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user in fake database
    const user = FAKE_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 },
      )
    }

    // Create fake JWT token (replace with real JWT later)
    const fakeToken = `fake_jwt_${user.id}_${Date.now()}`

    // User data to return (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }

    // Create response with success
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: userData,
      token: fakeToken,
    })

    // Set HTTP-only cookie for authentication (replace with secure settings in production)
    response.cookies.set("auth_token", fakeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days if remember, 1 day otherwise
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
