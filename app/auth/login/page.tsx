"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Handle different error types
        switch (result.error) {
          case "CredentialsSignin":
            setError("بيانات الدخول غير صحيحة")
            break
          case "Email and password required":
            setError("البريد الإلكتروني وكلمة المرور مطلوبان")
            break
          case "No user found with that email":
            setError("لا يوجد مستخدم بهذا البريد الإلكتروني")
            break
          case "Invalid password":
            setError("كلمة المرور غير صحيحة")
            break
          case "This account is not configured for password login":
            setError("هذا الحساب غير مهيأ لتسجيل الدخول بكلمة المرور")
            break
          default:
            setError("حدث خطأ في تسجيل الدخول")
        }
      } else if (result?.ok) {
        // Method 1: Force a hard refresh before navigation
        window.location.href = "/main"
        
        // Alternative Method 2: Multiple refresh calls with delay
        // router.refresh()
        // await new Promise(resolve => setTimeout(resolve, 100))
        // router.refresh()
        // router.push("/main")
        
        // Alternative Method 3: Use window.location.reload() then navigate
        // window.location.reload()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[93svh] bg-gray-50">
      <div className="container-mobile py-4 sm:py-8">
        <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-xl text-[#4531fc] sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">تسجيل الدخول</h1>
          <p className="text-gray-700 mb-4 sm:mb-6 text-center text-sm sm:text-base leading-relaxed">
            مرحباً بك مرة أخرى في تجمع الأمازيغية هويتنا. سجل دخولك للمتابعة والتفاعل مع المجتمع.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full form-input-mobile"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور"
                className="w-full form-input-mobile"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded touch-target"
                />
                <label htmlFor="remember" className="mr-2 block text-sm text-gray-900">
                  تذكرني
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full touch-target bg-[#4531fc]" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                سجل الآن مجاناً
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800 font-medium mb-2">للتجربة، استخدم:</p>
            <p className="text-xs text-blue-700">البريد: admin@tamazight.com</p>
            <p className="text-xs text-blue-700">كلمة المرور: 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}