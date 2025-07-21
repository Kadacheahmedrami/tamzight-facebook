// shared/FormComponents.tsx
"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InputFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}

interface TextareaFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  placeholder?: string
  required?: boolean
  rows?: number
  className?: string
}

interface SelectFieldProps {
  options: string[]
  placeholder: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  className?: string
}

export const InputField: React.FC<InputFieldProps> = ({ 
  value, 
  onChange, 
  error, 
  className = "", 
  ...props 
}) => (
  <div className="space-y-1">
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-sm ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
)

export const TextareaField: React.FC<TextareaFieldProps> = ({ 
  value, 
  onChange, 
  error, 
  className = "",
  ...props 
}) => (
  <div className="space-y-1">
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-sm resize-none ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
)

export const SelectField: React.FC<SelectFieldProps> = ({ 
  options, 
  placeholder, 
  value, 
  onChange, 
  error,
  className = ""
}) => (
  <div className="space-y-1">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`text-sm ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
)

interface BaseModalHeaderProps {
  children: React.ReactNode
}

export const BaseModalHeader: React.FC<BaseModalHeaderProps> = ({ children }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
      <span className="text-white text-lg font-semibold">س</span>
    </div>
    <div>
      <p className="font-medium">سيبتموس الليبي</p>
      <p className="text-sm text-gray-500">من ليبيا</p>
    </div>
  </div>
)

interface CategorySelectorsProps {
  category: string
  subcategory: string
  onCategoryChange: (value: string) => void
  onSubcategoryChange: (value: string) => void
  categoryError?: string | null
  categoryOptions: string[]
  subcategoryOptions: string[]
}

export const CategorySelectors: React.FC<CategorySelectorsProps> = ({
  category,
  subcategory,
  onCategoryChange,
  onSubcategoryChange,
  categoryError,
  categoryOptions,
  subcategoryOptions
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <SelectField
      options={categoryOptions}
      placeholder="اختار قسم رئيسي *"
      value={category}
      onChange={onCategoryChange}
      error={categoryError}
    />
    <SelectField
      options={subcategoryOptions}
      placeholder="اختار قسم فرعي"
      value={subcategory}
      onChange={onSubcategoryChange}
    />
  </div>
)