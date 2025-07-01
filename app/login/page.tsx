"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuthContext } from "@/components/auth-provider"

export default function LoginPage() {
  const { login } = useAuthContext()
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
      const result = await login(formData.email, formData.password, formData.remember)

      if (result.success) {
        router.push("/")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">تسجيل الدخول</h1>
        <p className="text-gray-700 mb-6 text-center">
          مرحباً بك مرة أخرى في تجمع الأمازيغية هويتنا. سجل دخولك للمتابعة والتفاعل مع المجتمع.
        </p>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

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
              className="w-full"
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
              className="w-full"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="mr-2 block text-sm text-gray-900">
                تذكرني
              </label>
            </div>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
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
  )
}
