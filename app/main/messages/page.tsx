
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
     
      <div className="max-w-7xl mx-auto flex">

            {/* Right Sidebar - Main Navigation */}
            <Sidebar />
     

        {/* Main Content - Messaging Area */}
        <div className="flex-1 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>مراسلتك مع الاعضاء</span>
              </div>
            </nav>

            {/* Messaging Area */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex flex-col h-96 overflow-y-auto">
                {/* Sample Message */}
                <div className="mb-2">
                  <div className="flex items-start">
                    <img
                      src="/placeholder.svg?height=30&width=30"
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <span className="text-sm font-medium">اسم المستخدم</span>
                      <p className="text-gray-700 text-sm">مرحبا، كيف حالك؟</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">منذ 5 دقائق</span>
                </div>
                {/* Sample Message */}
                <div className="mb-2 self-end">
                  <div className="flex items-start flex-row-reverse">
                    <img
                      src="/placeholder.svg?height=30&width=30"
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full ml-2"
                    />
                    <div>
                      <span className="text-sm font-medium">اسم المستخدم</span>
                      <p className="text-gray-700 text-sm">بخير، شكرا لك</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">منذ 2 دقائق</span>
                </div>
              </div>

              {/* Message Input */}
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="اكتب رسالتك هنا"
                    className="pr-10 text-right w-full border rounded-md py-2 px-3"
                  />
                  <Button size="sm" className="absolute left-1 top-1/2 -translate-y-1/2">
                    ارسل
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
   {/* Left Content - Messaging Settings */}
   <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">اعدادات المراسلة</h3>
            <fieldset className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">من يمكنه مراسلتك</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="country-only"
                      name="messaging-permission"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="country-only" className="ml-3 block text-sm text-gray-700">
                      ابناء بلدي فقط
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="no-country"
                      name="messaging-permission"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="no-country" className="ml-3 block text-sm text-gray-700">
                      ليس ابناء بلدي
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="everyone-except"
                      name="messaging-permission"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="everyone-except" className="ml-3 block text-sm text-gray-700">
                      الجميع باستثناء
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="everyone"
                      name="messaging-permission"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="everyone" className="ml-3 block text-sm text-gray-700">
                      الجميع
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">اظهار تواجدك</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hide-presence"
                      name="presence"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="hide-presence" className="ml-3 block text-sm text-gray-700">
                      عدم الاظهار
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hide-presence-except"
                      name="presence"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="hide-presence-except" className="ml-3 block text-sm text-gray-700">
                      عدم الاظهار باستثناء
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show-presence"
                      name="presence"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="show-presence" className="ml-3 block text-sm text-gray-700">
                      اظهار للجميع
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>
            <Button size="sm">حفظ الاعدادات</Button>
          </div>
        </div>
    
      </div>
    </div>
  )
}
