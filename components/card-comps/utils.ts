import { MediaItem } from './types'

export const getCurrentRoute = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const lastSegment = pathSegments[pathSegments.length - 1]
  const isIdSegment = /^[a-zA-Z0-9-_]+$/.test(lastSegment) && pathSegments.length > 2
  
  if (isIdSegment) {
    return '/' + pathSegments.slice(0, -1).join('/')
  }
  return pathname
}

export const combineMediaSources = (
  media: MediaItem[] = [],
  image?: string,
  images: string[] = [],
  title: string = ''
): MediaItem[] => {
  let combinedMedia: MediaItem[] = [...media]
  
  // Add single image if provided
  if (image) {
    combinedMedia.push({
      id: `img-${Date.now()}`,
      type: 'image',
      url: image,
      alt: title
    })
  }
  
  // Add multiple images if provided
  if (images.length > 0) {
    const imageMedia = images.map((img, index) => ({
      id: `img-${index}-${Date.now()}`,
      type: 'image' as const,
      url: img,
      alt: `${title} - Image ${index + 1}`
    }))
    combinedMedia.push(...imageMedia)
  }
  
  return combinedMedia
}

export const truncateContent = (content: string, maxLength: number = 200): {
  isLong: boolean
  truncated: string
} => {
  const isLong = content.length > maxLength
  const truncated = isLong ? content.substring(0, maxLength) + "..." : content
  
  return { isLong, truncated }
}