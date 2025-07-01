"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, FileUp, Video } from "lucide-react"

export default function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle post creation
    console.log({ title, content, category })
    setIsOpen(false)
    setTitle("")
    setContent("")
    setCategory("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="post-card cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
            <Input
              placeholder="إنشاء منشور جديد ونشره في هذا القسم"
              className="flex-1 cursor-pointer text-sm sm:text-base"
              readOnly
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">إنشاء منشور جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
            <div>
              <p className="font-medium text-sm sm:text-base">سيبتموس الليبي</p>
              <p className="text-xs sm:text-sm text-gray-500">من ليبيا</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="اختار قسم رئيسي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nation">الأمة الأمازيغية</SelectItem>
                <SelectItem value="language">اللغة الأمازيغية</SelectItem>
                <SelectItem value="personalities">شخصيات امازيغية</SelectItem>
                <SelectItem value="civilization">الحضارة الأمازيغية</SelectItem>
                <SelectItem value="art">الفن الأمازيغي</SelectItem>
                <SelectItem value="clothing">اللباس الأمازيغي</SelectItem>
                <SelectItem value="food">الاكل الأمازيغي</SelectItem>
                <SelectItem value="crafts">الحرف الامازيغية</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="اختار قسم فرعي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="definition">تعريف</SelectItem>
                <SelectItem value="history">تاريخ</SelectItem>
                <SelectItem value="origin">أصل</SelectItem>
                <SelectItem value="culture">ثقافة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="اكتب عنوان المنشور هنا"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input-mobile"
            required
          />

          <Textarea
            placeholder="أكتب منشورك هنا وانشره للجميع"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="form-input-mobile resize-none"
            required
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">أضف لمنشورك:</span>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" className="text-xs sm:text-sm bg-transparent">
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                صورة
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-xs sm:text-sm bg-transparent">
                <FileUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                ملف
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-xs sm:text-sm bg-transparent">
                <Video className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                فيديو
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="touch-target bg-transparent"
            >
              إلغاء
            </Button>
            <Button type="submit" className="touch-target">
              أنشر منشورك الآن
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
