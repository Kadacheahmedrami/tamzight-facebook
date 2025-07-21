import { ContentType } from "./types"
// shared/utils.ts
export const submitContent = async (type: ContentType, data: any) => {
    try {
      const response = await fetch('/api/main/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      })
  
      if (!response.ok) {
        throw new Error('Failed to submit content')
      }
  
      return await response.json()
    } catch (error) {
      console.error('Network error:', error)
      throw error
    }
  }