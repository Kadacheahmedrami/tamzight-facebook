import { ReactNode } from "react";
import { getStats } from "@/app/action/getStats";
import Sidebar from "@/components/sidebar";
import LeftSidebar from "@/components/LeftSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "@/components/header";
import { getUserData } from "@/app/action/UserData";
import ChatWidget from "@/components/chat-widget"
interface LayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

interface Stats {
  posts: number;
  truth: number;
  questions: number;
  books: number;
  images: number;
  videos: number;
  ads: number;
  shop: number;
  ideas: number;
  support: number;
}

export default async function MainLayout({
  children,
  showRightSidebar = true,
}: LayoutProps) {
  const session = await getServerSession(authOptions);
  const stats = await getStats(); // server action call
  const userData = await getUserData(); // server action call for user data
  
  return (
    <>
      <Header 
        user={session?.user || null} 
        stats={stats}
        notifications={userData.notifications}
        messages={userData.messages}
        unreadNotifications={userData.unreadNotifications}
        unreadMessages={userData.unreadMessages} 
      /> 
      <div className="h-[calc(100svh-7svh)] bg-gray-50">
        <div className="max-w-7xl mx-auto flex h-full">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full">
            <Sidebar stats={stats} />
          </div>

          {/* Main Content */}
          <div className="flex-1 h-full mb-8  md:ml-4  md:mr-6 overflow-x-hidden overflow-y-auto p-4">
            {children}
          </div>

          {/* Left Sidebar - Desktop Only */}
          {showRightSidebar && <LeftSidebar session={session} />}
        </div>
      </div>
      <ChatWidget />
    </>
  );
}