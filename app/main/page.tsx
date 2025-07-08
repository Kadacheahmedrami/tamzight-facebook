"use client"

import { useEffect, useState } from "react"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  alt?: string
  duration?: string
  resolution?: string
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  media?: MediaItem[]
  image?: string
  images?: string[]
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

interface Stats {
  totalPosts: number
  todayPosts: number
  trendingPosts: number
}

interface TrendingTopic {
  id: number
  hashtag: string
  count: number
  color: string
}

export default function LatestPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchPosts = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/posts" : `/api/main/posts?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      
      // Transform the data to match PostCard expected format
      const transformedPosts = data.map((post: any) => ({
        ...post,
        id: post.id?.toString() || Math.random().toString(36).substr(2, 9),
        authorId: post.authorId || post.author?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
        subCategory: post.subCategory || undefined,
        media: post.media || [],
        images: post.images || []
      }))
      
      setPosts(transformedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      // Fallback sample data with proper structure
      const samplePosts: Post[] = [
        {
          id: "1",
          title: "تاريخ الأمازيغ في شمال أفريقيا",
          content: "الأمازيغ هم السكان الأصليون لشمال أفريقيا، وتمتد جذورهم التاريخية إلى آلاف السنين. لقد شكلوا حضارة عريقة وثقافة غنية تميزت بالتنوع اللغوي والثقافي والفني. من الجبال الأطلسية إلى واحات الصحراء الكبرى، انتشرت القبائل الأمازيغية وأسست ممالك وإمارات قوية. تتميز الثقافة الأمازيغية بنظام اجتماعي متين يقوم على التضامن والتعاون المجتمعي.",
          author: "أحمد أمازيغ",
          authorId: "ahmed_amazigh",
          timestamp: "منذ ساعتين",
          category: "الأمة الأمازيغية",
          subCategory: "التاريخ",
          image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop",
          stats: {
            views: 1250,
            likes: 89,
            comments: 23,
            shares: 15
          }
        },
        {
          id: "2",
          title: "تعلم اللغة الأمازيغية - الأساسيات",
          content: "اللغة الأمازيغية (تمازيغت) هي لغة أفريقية أصيلة تنتمي إلى عائلة اللغات الأفريقية الآسيوية. تتنوع اللهجات الأمازيغية عبر المناطق الجغرافية المختلفة، من الريف في المغرب إلى الطوارق في الصحراء. تتميز بنظام كتابة فريد يسمى تيفيناغ، وهو أحد أقدم أنظمة الكتابة في العالم.",
          author: "فاطمة تمازيغت",
          authorId: "fatima_tamazight",
          timestamp: "منذ 3 ساعات",
          category: "اللغة الأمازيغية",
          subCategory: "التعليم",
          images: [
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
          ],
          stats: {
            views: 890,
            likes: 67,
            comments: 18,
            shares: 12
          }
        },
        {
          id: "3",
          title: "شخصيات أمازيغية مؤثرة عبر التاريخ",
          content: "عبر التاريخ، برزت شخصيات أمازيغية عظيمة تركت بصمات لا تمحى في التاريخ. من الملكة ديهيا (الكاهنة) التي قادت المقاومة، إلى القائد طارق بن زياد الذي فتح الأندلس، وصولاً إلى المفكرين والأدباء المعاصرين. هؤلاء الأبطال يمثلون روح الأمة الأمازيغية وقوتها.",
          author: "يوسف أزنكاد",
          authorId: "youssef_azenkad",
          timestamp: "منذ 5 ساعات",
          category: "شخصيات امازيغية",
          media: [
            {
              id: "vid1",
              type: "video",
              url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              thumbnail: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop",
              duration: "5:30",
              alt: "فيديو عن الشخصيات الأمازيغية"
            },
            {
              id: "img1",
              type: "image",
              url: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=300&fit=crop",
              alt: "صورة تاريخية"
            }
          ],
          stats: {
            views: 2100,
            likes: 156,
            comments: 42,
            shares: 28
          }
        },
        {
          id: "4",
          title: "الفنون الأمازيغية التقليدية",
          content: "تتميز الفنون الأمازيغية بالغنى والتنوع، من الموسيقى التقليدية إلى الحرف اليدوية والرقص الفولكلوري. السجاد الأمازيغي، والفضيات، والخزف، كلها تعكس هوية ثقافية عميقة متجذرة في التاريخ.",
          author: "أمينة تافراوت",
          authorId: "amina_tafraoute",
          timestamp: "منذ يوم",
          category: "الفن الأمازيغي",
          subCategory: "التراث",
          images: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1561131668-5b0c56c23b88?w=400&h=300&fit=crop"
          ],
          stats: {
            views: 1450,
            likes: 98,
            comments: 31,
            shares: 19
          }
        }
      ]
      setPosts(samplePosts)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch("/api/main/trending")
      const data = await response.json()
      setTrendingTopics(data)
    } catch (error) {
      console.error("Error fetching trending topics:", error)
      // Fallback sample data
      const sampleTopics = [
        { id: 1, hashtag: "#الأمازيغية", count: 125, color: "blue" },
        { id: 2, hashtag: "#تافيناغ", count: 89, color: "green" },
        { id: 3, hashtag: "#التراث_الأمازيغي", count: 67, color: "yellow" },
        { id: 4, hashtag: "#شمال_أفريقيا", count: 45, color: "red" },
      ]
      setTrendingTopics(sampleTopics)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchTrendingTopics()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchPosts(category)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>منشورات حول الامة الامازيغ</span>
        </div>
      </nav>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض اخر منشورات حول:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم لعرضه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="nation">الأمة الأمازيغية</SelectItem>
              <SelectItem value="language">اللغة الأمازيغية</SelectItem>
              <SelectItem value="personalities">شخصيات امازيغية</SelectItem>
              <SelectItem value="civilization">الحضارة الأمازيغية</SelectItem>
              <SelectItem value="art">الفن الأمازيغي</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={() => fetchPosts(selectedCategory)} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
          >
            اعرض
          </Button>
        </div>
      </div>

      {/* Create Post */}
      <CreatePostModal />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.author}
              authorId={post.authorId}
              timestamp={post.timestamp}
              category={post.category}
              subCategory={post.subCategory}
              media={post.media}
              image={post.image}
              images={post.images}
              baseRoute="/main/posts"
              stats={post.stats}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-600 text-lg mb-2">لا توجد منشورات في هذا القسم</p>
              <p className="text-gray-500 text-sm">جرب تغيير الفئة أو أضف منشوراً جديداً</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}