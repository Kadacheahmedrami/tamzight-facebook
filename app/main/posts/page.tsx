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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
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
          title: "الحضارة الأمازيغية عبر التاريخ",
          content: "تعد الحضارة الأمازيغية من أقدم الحضارات في شمال أفريقيا، حيث تمتد جذورها إلى آلاف السنين. شهدت هذه الحضارة تطوراً مستمراً في مختلف المجالات من الزراعة إلى الفنون والعمارة. تتميز بنظام اجتماعي متطور يقوم على المجالس المحلية والقيم التشاركية، كما طورت أنظمة ري متقدمة وتقنيات زراعية مبتكرة تناسب البيئة الصحراوية والجبلية.",
          author: "الدكتور محمد أمازيغ",
          authorId: "dr_mohammed_amazigh",
          timestamp: "منذ ساعة",
          category: "تاريخية",
          subCategory: "الحضارة القديمة",
          image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=400&fit=crop",
          stats: {
            views: 2150,
            likes: 185,
            comments: 42,
            shares: 28
          }
        },
        {
          id: "2",
          title: "الرموز والكتابة التيفيناغية",
          content: "تيفيناغ هو النظام الكتابي الأصلي للأمازيغ، وهو أحد أقدم أنظمة الكتابة في العالم. يتميز بطابعه الهندسي الفريد ورموزه المميزة التي تعكس الهوية الثقافية العميقة. تم إحياء هذا النظام في العصر الحديث وأصبح رمزاً للنهضة الثقافية الأمازيغية.",
          author: "أمينة تيفيناغ",
          authorId: "amina_tifinagh",
          timestamp: "منذ ساعتين",
          category: "لغوية",
          subCategory: "الكتابة والخط",
          images: [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=400&h=300&fit=crop"
          ],
          stats: {
            views: 1680,
            likes: 142,
            comments: 35,
            shares: 22
          }
        },
        {
          id: "3",
          title: "الموسيقى الأمازيغية التقليدية",
          content: "تشكل الموسيقى جزءاً لا يتجزأ من الثقافة الأمازيغية، حيث تعبر عن تاريخ وتراث عريق يمتد لآلاف السنين. من أحيدوس في الأطلس إلى أهيا في الصحراء، تتنوع الأشكال الموسيقية وتعكس ثراء الحياة الاجتماعية والروحية للأمازيغ. تستخدم آلات تقليدية مثل البندير والعود والناي.",
          author: "يوسف أحيدوس",
          authorId: "youssef_ahidous",
          timestamp: "منذ 3 ساعات",
          category: "فنية",
          subCategory: "الموسيقى التقليدية",
          media: [
            {
              id: "music_video_1",
              type: "video",
              url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
              duration: "3:45",
              alt: "عرض موسيقي أمازيغي تقليدي"
            },
            {
              id: "music_img_1",
              type: "image",
              url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=300&fit=crop",
              alt: "آلات موسيقية أمازيغية"
            }
          ],
          stats: {
            views: 3200,
            likes: 267,
            comments: 58,
            shares: 45
          }
        },
        {
          id: "4",
          title: "التراث الشفهي والحكايات الأمازيغية",
          content: "يحتل التراث الشفهي مكانة مهمة في الثقافة الأمازيغية، حيث تنقل الحكايات والأساطير من جيل إلى جيل. تحكي هذه القصص عن الأبطال والحكماء، وتعلم القيم الأخلاقية والاجتماعية. من أشهر الشخصيات الأسطورية جحا الأمازيغي وأسطورة تانيت إلهة الخصوبة.",
          author: "زينب تامازيغت",
          authorId: "zeinab_tamazight",
          timestamp: "منذ 4 ساعات",
          category: "ثقافية",
          subCategory: "التراث الشفهي",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
          stats: {
            views: 1420,
            likes: 98,
            comments: 29,
            shares: 18
          }
        },
        {
          id: "5",
          title: "الفنون التشكيلية الأمازيغية المعاصرة",
          content: "تشهد الفنون التشكيلية الأمازيغية نهضة حقيقية في العصر الحديث، حيث يمزج الفنانون بين التقاليد الأصيلة والتقنيات المعاصرة. من النقش على الخشب إلى الرسم على الجدران، تعبر هذه الأعمال عن الهوية الثقافية وتحافظ على الإرث الفني العريق.",
          author: "كريم أزرو",
          authorId: "karim_azrou",
          timestamp: "منذ 5 ساعات",
          category: "فنية",
          subCategory: "الفنون التشكيلية",
          images: [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1561131668-5b0c56c23b88?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
          ],
          stats: {
            views: 1890,
            likes: 156,
            comments: 38,
            shares: 25
          }
        },
        {
          id: "6",
          title: "اللهجات الأمازيغية المتنوعة",
          content: "تتنوع اللهجات الأمازيغية عبر الجغرافيا الواسعة لشمال أفريقيا، من تمازيغت في المغرب إلى تاقبايليت في الجزائر وتماشك عند الطوارق. كل لهجة تحمل خصائص فريدة تعكس البيئة المحلية والتاريخ الاجتماعي للمنطقة.",
          author: "أحمد أمازيغ",
          authorId: "ahmed_amazigh_lang",
          timestamp: "منذ 6 ساعات",
          category: "لغوية",
          subCategory: "اللهجات المحلية",
          media: [
            {
              id: "lang_video_1",
              type: "video",
              url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
              duration: "7:20",
              alt: "درس في اللهجات الأمازيغية"
            }
          ],
          stats: {
            views: 2340,
            likes: 198,
            comments: 47,
            shares: 31
          }
        }
      ]
      setPosts(samplePosts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
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
          <label className="text-sm font-medium whitespace-nowrap">اعرض منشورات:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="history">تاريخية</SelectItem>
              <SelectItem value="culture">ثقافية</SelectItem>
              <SelectItem value="language">لغوية</SelectItem>
              <SelectItem value="art">فنية</SelectItem>
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
              baseRoute="/posts"
              stats={post.stats}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg mb-2">لا توجد منشورات في هذا القسم</p>
              <p className="text-gray-500 text-sm">جرب تغيير الفئة أو ابحث عن محتوى آخر</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}