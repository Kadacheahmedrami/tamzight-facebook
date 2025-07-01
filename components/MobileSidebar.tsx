"use client"
import React, { useState } from 'react';
import { Archive, Menu, ChevronRight, X } from "lucide-react";

const navigationItems = [
  { href: "/", icon: ChevronRight, label: "الصفحة الرئيسية", description: "العودة للصفحة الرئيسية" },
  { href: "/truth", icon: ChevronRight, label: "حقائق ثابتة حول الامازيغ", description: "حقائق تاريخية وثقافية" },
  { href: "/posts", icon: ChevronRight, label: "منشورات حول الامة الامازيغ", description: "منشورات ومقالات متنوعة" },
  { href: "/books", icon: ChevronRight, label: "كُتب امازيغية متنوعة", description: "مكتبة الكتب الامازيغية" },
  { href: "/videos", icon: ChevronRight, label: "فيديوهات امازيغية متنوعة", description: "مقاطع فيديو تعليمية وثقافية" },
  { href: "/images", icon: ChevronRight, label: "صور امازيغية متنوعة", description: "معرض الصور التراثية" },
  { href: "/questions", icon: ChevronRight, label: "اسئلة أمازيغية", description: "أسئلة للإجابة والتصويت" },
  { href: "/ads", icon: ChevronRight, label: "اعلانات امازيغية", description: "إعلانات ترويجية متنوعة" },
  { href: "/shop", icon: ChevronRight, label: "تسوق صناعات امازيغية", description: "منتجات تقليدية أصيلة" },
  { href: "/ideas", icon: ChevronRight, label: "اقتراحات لتطوير المنصة", description: "أفكار لتحسين التجمع" },
  { href: "/support", icon: Archive, label: "صندوق دعم الامازيغ", description: "دعم المشاريع الخيرية" },
  { href: "/friends", icon: ChevronRight, label: "اصدقاء من الامازيغ", description: "تواصل مع الأعضاء" },
  { href: "/messages", icon: ChevronRight, label: "مراسلات بين الاعضاء", description: "الرسائل الخاصة" },
  { href: "/member", icon: ChevronRight, label: "ملف العضو", description: "الملف الشخصي" },
  { href: "/settings", icon: ChevronRight, label: "اعدادات ملفي الشخصي", description: "إعدادات الحساب" },
];

const MobileSidebar = ({ title = "تجمع الأمازيغ", description = "منصة التواصل الأمازيغية" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("/");

  const handleItemClick = (href) => {
    setActiveItem(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Archive className="h-6 w-6 text-blue-200" />
            <div>
              <h1 className="font-bold text-lg">{title}</h1>
              <p className="text-blue-200 text-sm">{description}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg text-white hover:bg-blue-700 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden overflow-y-auto max-h-screen ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col min-h-full">
          
          {/* Close Button */}
          <div className="absolute left-4 top-4 z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="h-11 w-11 p-0 rounded-full hover:bg-gray-100 shadow-md bg-white border flex items-center justify-center"
            >
              <span className="text-lg">×</span>
              <span className="sr-only">إغلاق</span>
            </button>
          </div>

          {/* Header Section */}
          <div className="flex-shrink-0 bg-gradient-to-b from-blue-600 to-white p-6 pt-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-12 w-auto" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">تجمع الأمازيغ</h2>
            <p className="text-blue-100 text-sm">منصة التواصل الأمازيغية</p>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-3">
              {navigationItems.map((item) => {
                const isActive = activeItem === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleItemClick(item.href)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:translate-x-1 group ${
                      isActive ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-blue-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? "bg-gradient-to-br from-blue-500 to-teal-500 shadow-md"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      }`}
                    >
                      <item.icon className="h-5 w-5 text-white flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                        {item.label}
                      </h3>
                      <p className={`text-sm truncate ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t bg-gray-50">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">منصة تجمع الأمازيغ</p>
              <p className="text-xs text-gray-400">الأمازيغية هويتنا</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Export both named and default exports to support both import styles
export { MobileSidebar };
export default MobileSidebar;