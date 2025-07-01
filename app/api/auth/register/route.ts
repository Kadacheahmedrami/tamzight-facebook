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
    const { firstName, lastName, email, password, confirmPassword } = body

    // Validate input
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "كلمات المرور غير متطابقة" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني غير صحيح" }, { status: 400 })
    }

    // Simulate database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = FAKE_USERS.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: FAKE_USERS.length + 1,
      email,
      password, // In real implementation, hash this password
      firstName,
      lastName,
      role: "user",
    }

    // Add to fake database
    FAKE_USERS.push(newUser)

    // Create fake JWT token (replace with real JWT later)
    const fakeToken = `fake_jwt_${newUser.id}_${Date.now()}`

    // User data to return (exclude password)
    const userData = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    }

    // Create response with success
    const response = NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: userData,
      token: fakeToken,
    })

    // Set HTTP-only cookie for authentication
    response.cookies.set("auth_token", fakeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 1 day
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
