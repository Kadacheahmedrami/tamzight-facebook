import { NextResponse } from "next/server"

export async function GET() {
  const trendingTopics = [
    {
      id: 1,
      hashtag: "#الأمازيغية_هويتنا",
      count: 1250,
      color: "blue",
    },
    {
      id: 2,
      hashtag: "#تعلم_الأمازيغية",
      count: 890,
      color: "green",
    },
    {
      id: 3,
      hashtag: "#التراث_الأمازيغي",
      count: 675,
      color: "yellow",
    },
    {
      id: 4,
      hashtag: "#الثقافة_الأمازيغية",
      count: 543,
      color: "red",
    },
    {
      id: 5,
      hashtag: "#امازيغ_باقون",
      count: 432,
      color: "purple",
    },
  ]

  return NextResponse.json(trendingTopics)
}
