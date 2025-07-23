import React from 'react';
import Link from 'next/link';
import Header from "@/components/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const features = [
  // quick‑action buttons (no change)
  { icon: 'fas fa-user-circle', color: '#4531fc', title: 'ملف شخصي على التجمع',       description: '' },
  { icon: 'fas fa-comments', color: '#4531fc', title: 'مراسلات بين الأعضاء',        description: '' },
  { icon: 'fas fa-bell', color: '#4531fc', title: 'إشعارات أقسام التجمع',     description: '' },
  { icon: 'fas fa-user-friends ', color: '#4531fc', title: 'أصدقاء من الأمازيغ',         description: '' },

 


  // 1. حقائق ثابتة حول الأمازيغي
  {
    icon: 'fas fa-sun',
    color: '#4531fc',
    title: 'حقائق ثابتة حول الأمازيغي',
    description: `يمكنك في هذا القسم الاطلاع على الكثير من الحقائق المُهمة حول حقيقة الأُمة الأمازيغية الأفريقية من جميع النواحي، 
ويُمكنك أيضاً المُشاركة بنفسك في نشر مثل هذه الحقائق التاريخية في الماضي والحاضر حول الأُمة الأمازيغية الأفريقية، 
إذا أنت أحد الأمازيغ الأحرار، أو أنت مهتم بحقيقة هذه الأُمة الأفريقية، وسواء أنت رجلاً أو امرأة، 
فمرحبا بك على تجمع الأمازيغية هويتنا لمعرفة الحقيقة الأكيدَة حول الأُمة الأمازيغية الأفريقية.`,
  },

  // 2. منشورات حول الأمة الأمازيغي
  {
    icon: 'fas fa-edit',
    color: '#4531fc',
    title: 'منشورات حول الأمة الأمازيغي',
    description: `يتم في هذا القسم نشر منشورات خاصة حول الأُمة الأمازيغية الأفريقية من ناحية أصلُهم ولغتهُم وتاريخهم وحضارتهم وفنونهُم وأدبهم وعلمهم ودينهم 
وشخصيتهم وأحداثهم التاريخية، ولباسهم وأكلهم وزواجهم التقليدي، وطرح الأسئلة للإجابة والتصويت عليها، 
ويمكن لجميع الأعضاء الأمازيغ نشر منشورات تتعلق فيما سبق ذكره، أو منشورات عامة وخاصة بهم وبحياتهم اليومية، 
وأهلاً ومرحبا بالجميع معنا وبيننا.`,
  },

  // 3. كتب أمازيغية متنوعة
  {
    icon: 'fas fa-book',
    color: '#4531fc',
    title: 'كتب أمازيغية متنوعة',
    description: `يحتوي هذا القسم على الكثير من الكُتب الأمازيغية وبأكثر من لغة، وهي كتب لتعليم اللغة الأمازيغية، 
وكتب تاريخية وثقافية عن الأُمة الأمازيغية وأصلها، وكتب أمازيغية أخرى متنوعة، 
حيث يُمكنك في هذا القسم تنزيل أي كتاب مجاني لتستفيد من محتواه، أو تقديم رأيك حول محتوى الكتاب، 
ويُمكنك أيضاً إضافة أي كتاب أمازيغي جديد ليستفيد منه جميع الأمازيغ حول العالم. 
فمرحبا بك معنا وبيننا في التجمع.`,
  },

  // 4. فيديوهات أمازيغية متنوعة
  {
    icon: 'fas fa-tv',
    color: '#4531fc',
    title: 'فيديوهات أمازيغية متنوعة',
    description: `يعرض هذا القسم الأمازيغي فيديوهات تتعلق بكل شيء حول الحياة والمعيشة اليومية للأُمة الأمازيغية الأفريقية، 
مثل فيديوهات عن الحضارة الأمازيغية أو العادات والتقاليد الأمازيغية أو اللباس الأمازيغي أو الغناء الأمازيغي 
أو تعليم اللغة الأمازيغية بحروف تيفيناغ أو غيرها، يمكنك المشاركة بنشر فيديو ليشاهده الجميع، فمرحبا بك معنا وبيننا.`,
  },

  // 5. إعلانات أمازيغية ترويجية
  {
    icon: 'fas fa-bullhorn',
    color: '#4531fc',
    title: 'إعلانات أمازيغية ترويجية',
    description: `يحتوي هذا القسم على إعلانات أمازيغية يومية بجميع أنواعها المهمة، 
مثل إعلانات للمساهمة في بناء مدرسة أو بناء مركز صحي أو حفر بئر ماء أو زراعة أرض بالأشجار 
أو إعلان عن حالة وفاة أو نجاح أو حفلة زواج أو حفلة تخرج أو إعلان دعوة لاجتماع خاص أو عام 
أو إعلان طلب زواج، وجميعها إعلانات مجانية النشر، ويمكنك نشر إعلانك في هذا القسم في أي وقت، 
وأهلاً وسهلاً بك في أي وقت.`,
  },

  // 6. تسوق صناعات أمازيغية
  {
    icon: 'fas fa-store',
    color: '#4531fc',
    title: 'تسوق صناعات أمازيغية',
    description: `هذا القسم خاص بتسويق الصناعات الأمازيغية التقليدية فقط، 
مثل صناعة الملابس والأقمشة والسجاد والمفروشات والأحذية والأواني الفخارية والمعدنية والخشبية، 
وغيرهم من الصناعات الأمازيغية التقليدية، ويُمنع في هذا القسم نشر أي صناعة أخرى غير الصناعة الأمازيغية الأفريقية، 
فمرحبا بك في هذا القسم ومحتواه.`,
  },

  // 7. اقتراح لتطوير تجمع الأمازيغي
  {
    icon: 'fas fa-lightbulb',
    color: '#4531fc',
    title: 'اقتراح لتطوير تجمع الأمازيغي',
    description: `يمكنك في هذا القسم تقديم أي اقتراح أو فكرة جميلة لمشرفي هذه المنصة الإلكترونية للتواصل الاجتماعي 
الخاصة بالأُمة الأمازيغية الأفريقية، من أجل تطويرها إلى الأفضل، أو تعديل أي قسم موجود، أو إضافة قسم جديد إليها، 
ليصبح ظهورها بشكل أجمل وأفضل لجميع مستخدميها الأمازيغ وغيرهم من ضيوفهم الكرام، 
فأهلاً بك وباقتراحك وفكرتك لنا.`,
  },

  // 8. صندوق دعم الأمازيغه
  {
    icon: 'fas fa-archive',
    color: '#4531fc',
    title: 'صندوق دعم الأمازيغه',
    description: `هذا الصندوق الخاص بدعم الأمازيغ بصفة خاصة وعامة، وهو صندوق يُساعد في بناء مدارس تعليمية 
أو مراكز صحية أو آبار مائية أو مُساعدة كبار السن والمرضى صحياً من أبناء وبنات الشعب الأمازيغي الأفريقي، 
والمُساهمة في دعم هذا الصندوق يكون من الشعب الأمازيغي ومن داخل الوطن فقط، 
وكل واحد يُساعد على حسب قدرته لذلك سبيل في أي وقت يُريد ذلك.`,
  },
];

const footerLinks = [
  { 
    title: 'حول التجمع', 
    icon: 'fas fa-info-circle',
    items: [
      { text: 'أهداف تجمع الأمازيغ', icon: 'fas fa-bullseye' },
      { text: 'لغات تجمع موقعنا', icon: 'fas fa-language' },
      { text: 'نبذة أهمية تراث الأمازيغ', icon: 'fas fa-landmark' },
      { text: 'برنامج أو تور تيجة الأمازيغية', icon: 'fas fa-route' }
    ]
  },
  { 
    title: 'تحميل تطبيقاتنا', 
    icon: 'fas fa-download',
    items: [
      { text: 'تحميل تطبيق للهاتف الذكي', icon: 'fas fa-mobile-alt' },
      { text: 'تحميل ملف أيقونات للهاتف الذكي', icon: 'fas fa-icons' },
      { text: 'تحميل تطبيق لجهاز الكمبيوتر', icon: 'fas fa-desktop' },
      { text: 'مدونة الأمازيغ', icon: 'fas fa-blog' }
    ]
  },
  { 
    title: 'للتواصل معنا', 
    icon: 'fas fa-envelope',
    items: [
      { text: 'تواصل معنا عبر تليجرام', icon: 'fab fa-telegram' },
      { text: 'تواصل معنا عبر الواتس آب', icon: 'fab fa-whatsapp' },
      { text: 'تواصل معنا عبر الفيسبوك', icon: 'fab fa-facebook' },
      { text: 'دليل موقع تجمع الأمازيغ', icon: 'fas fa-map' }
    ]
  },
  { 
    title: 'شعار تجمع الأمازيغ', 
    icon: 'fas fa-flag',
    items: [
      { text: 'الأمازيغية وحدتنا', icon: 'fas fa-unity' }
    ]
  },
];

export default async function HomePage() {
    const session = await getServerSession(authOptions);
  return (
    <>
        <Header  user={session?.user || null} />

        <div className="h-full overflow-y-auto bg-white" dir="rtl">
      {/* FontAwesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Introduction */}
      
        <section className="bg-white px-3 sm:px-6 py-6 sm:py-12">
          <h2 className="text-green-700 text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">
          أزول - سلام - تعريف بمنصة تجمع الامازيغ 
          </h2>
          <p className="text-blue-700 font-bold leading-relaxed sm:leading-loose text-sm sm:text-lg md:text-xl lg:text-2xl">
            تَجمُّع الامازيغ ... هي منصة تواصل اجتماعيّ تعرف بالهويّة الأمازيغية تاريخيّاً، وحضاريّاً، وثقافيّاً، وعلميّاً، وفنيّاً متنوّعاً في الماضي والحاضر ...
            مع التعريف بالقبائل والعائلات الأمازيغية وأصولهم ... وأماكن تواجدها في شمال أفريقيا والعالم.
            كما يقوم هذا التّجمُّع الأمازيغي بإحياء، وتعليم اللغة الأمازيغية بحروفها الأصليّة ومراحل تطورها عبر الزمن ...
            وندعو جميع أبناء وبنات الأمّة الأمازيغية الأفريقية حول العالم ...
            المساهمة والمشاركة معنا في إنجاح هذا التّجمُّع الأمازيغي الأفريقي العالمي على شبكة الانترنت ...
            من خلال الانضمام لهذا التّجمُّع الأمازيغي ...
            ونشر كل ما يتعلق بالامة الامازيغية الافريقية في الماضي والحاضر ...
            ودعوة الأهل والأقارب للانضمام الى هذا التّجمُّع الأمازيغي ...
            للاستفادة من محتواه الامازيغي المتنوع والجميل ...
            ويكون هذا التجمّع قاعدة بيانات ومعلومات لجميع الأمازيغ الأحرار حول العالم ...
            ولمن يُريد التعرّف على الهويّة الامازيغية الافريقية في الماضي والحاضر من اصدقاء الأمازيغ المغتربين حول العالم ...
            بإذن وتوفيق الله وحده في ذلك إن شاء الله.
          </p>

          <p className="text-red-600 font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2 sm:mt-4">
            الأمازيغ باقون ولن نزول إن شاء الله
          </p>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-blue-700 font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
            <i className="fas fa-sitemap text-xl sm:text-2xl md:text-3xl lg:text-4xl"></i>
            <a href="#" className="hover:underline">خريطة منصة تجمع الامازيغ</a>
          </div>
        </section>

        {/* Quick-Action Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.slice(0, 4).map((feat, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-row gap-3 items-center bg-gray-50 border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0">
                  <i className={`${feat.icon} text-xl md:text-2xl`} style={{ color: feat.color }}></i>
                </div>
                <span className="text-base md:text-lg font-semibold" style={{ color: feat.color }}>
                  {feat.title}
                </span>
              </div>
            );
          })}
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.slice(4).map((feat, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-col bg-gray-50 border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-start mb-2 space-x-reverse space-x-2">
                  <div className="w-8 h-8  rounded-md flex items-center justify-center ">
                    <i className={`${feat.icon} text-lg md:text-xl`} style={{ color: feat.color }}></i>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold" style={{ color: feat.color }}>
                    {feat.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed text-right">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 flex flex-row justify-center items-center text-white p-2 rounded-md text-center mb-8">
          <h2 className="text-lg md:text-xl">
            سجل دخولك للتجمع مجاناً، وأستفيد من محتوياته الامازيغية المتنوعة، وادعو اهلك واصدقائك الامازيغ للانضمام لهذا التجمع للتواصل الاجتماعي الامازيغي
          </h2>
          <Link href="/main" className="bg-white my-auto text-blue-600 px-2 mx-3 rounded-[5px] hover:bg-gray-50 transition-colors text-sm md:text-base">
            انضم إلينا
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#008000] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerLinks.map((col, idx) => (
            <div key={idx}>
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <i className={col.icon}></i>
                {col.title}
              </h3>
              <ul className="space-y-2 text-sm md:text-base">
                {col.items.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-green-200 transition-colors flex items-center gap-2">
                      <i className={item.icon}></i>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      {/* Bottom Bar */}
      <div className="bg-yellow-400  text-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <span className="  px-3 py-1 rounded text-xs flex items-center gap-1">
            <i className="fas fa-copyright"></i>
            حقوق الطبع والنشر محفوظة © تجمع الأمازيغ للتصميم والبرمجة 2025 - 2026
          </span>
          <div className="flex items-center space-x-reverse space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-gray-600 flex items-center gap-1">
              <i className="fas fa-shield-alt"></i>
              سياسة الخصوصية
            </a>
            <a href="#" className="hover:text-gray-600 flex items-center gap-1">
              <i className="fas fa-file-contract"></i>
              سياسة الاستخدام
            </a>
            <a href="#" className="hover:text-gray-600 flex items-center gap-1">
              <i className="fas fa-question-circle"></i>
              المساعدة
            </a>
          </div>
          <div className="flex items-center space-x-reverse space-x-2 text-xs mt-2 md:mt-0">
            <span className="flex items-center gap-1">
              <i className="fas fa-language"></i>
              ⵜⵉⴼⵉⵏⴰⵖ
            </span>
            <span>Tamazight</span>
            <span>عربي</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </div>
    </>
  
  );
}