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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <Input placeholder="إنشاء منشور جديد ونشره في هذا القسم" className="flex-1 cursor-pointer" readOnly />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إنشاء منشور جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div>
              <p className="font-medium">سيبتموس الليبي</p>
              <p className="text-sm text-gray-500">من ليبيا</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
              <SelectTrigger>
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
            required
          />

          <Textarea
            placeholder="أكتب منشورك هنا وانشره للجميع"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">أضف لمنشورك:</span>
            <Button type="button" variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4 ml-1" />
              صورة
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <FileUp className="h-4 w-4 ml-1" />
              ملف
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Video className="h-4 w-4 ml-1" />
              فيديو
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">أنشر منشورك الآن</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
