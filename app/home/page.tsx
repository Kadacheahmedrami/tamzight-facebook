'use client';

import Header from '@/components/header';
import {
  Users,
  Bell,
  MessageCircle,
  User,
  Edit,
  Settings,
  Monitor,
  BookOpen,
  Video,
  Megaphone,
  ShoppingCart,
  Archive,
  Lightbulb,
  Map
} from 'lucide-react';
import React from 'react';

const features = [
  // quick‑action buttons (no change)
  { icon: Users,       color: '#4531fc', title: 'أصدقاء من الأمازيغ',         description: '' },
  { icon: Bell,        color: '#4531fc', title: 'إشعارات أقسام التجمع',     description: '' },
  { icon: MessageCircle,color: '#4531fc', title: 'مراسلات بين الأعضاء',        description: '' },
  { icon: User,        color: '#4531fc', title: 'ملف شخصي على التجمع',       description: '' },

  // 1. حقائق ثابتة حول الأمازيغي
  {
    icon: Settings,
    color: '#4531fc',
    title: 'حقائق ثابتة حول الأمازيغي',
    description: `يمكنك في هذا القسم الاطلاع على الكثير من الحقائق المُهمة حول حقيقة الأُمة الأمازيغية الأفريقية من جميع النواحي، 
ويُمكنك أيضاً المُشاركة بنفسك في نشر مثل هذه الحقائق التاريخية في الماضي والحاضر حول الأُمة الأمازيغية الأفريقية، 
إذا أنت أحد الأمازيغ الأحرار، أو أنت مهتم بحقيقة هذه الأُمة الأفريقية، وسواء أنت رجلاً أو امرأة، 
فمرحبا بك على تجمع الأمازيغية هويتنا لمعرفة الحقيقة الأكيدَة حول الأُمة الأمازيغية الأفريقية.`,
  },

  // 2. منشورات حول الأمة الأمازيغي
  {
    icon: Edit,
    color: '#4531fc',
    title: 'منشورات حول الأمة الأمازيغي',
    description: `يتم في هذا القسم نشر منشورات خاصة حول الأُمة الأمازيغية الأفريقية من ناحية أصلُهم ولغتهُم وتاريخهم وحضارتهم وفنونهُم وأدبهم وعلمهم ودينهم 
وشخصيتهم وأحداثهم التاريخية، ولباسهم وأكلهم وزواجهم التقليدي، وطرح الأسئلة للإجابة والتصويت عليها، 
ويمكن لجميع الأعضاء الأمازيغ نشر منشورات تتعلق فيما سبق ذكره، أو منشورات عامة وخاصة بهم وبحياتهم اليومية، 
وأهلاً ومرحبا بالجميع معنا وبيننا.`,
  },

  // 3. كتب أمازيغية متنوعة
  {
    icon: BookOpen,
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
    icon: Monitor,
    color: '#4531fc',
    title: 'فيديوهات أمازيغية متنوعة',
    description: `يعرض هذا القسم الأمازيغي فيديوهات تتعلق بكل شيء حول الحياة والمعيشة اليومية للأُمة الأمازيغية الأفريقية، 
مثل فيديوهات عن الحضارة الأمازيغية أو العادات والتقاليد الأمازيغية أو اللباس الأمازيغي أو الغناء الأمازيغي 
أو تعليم اللغة الأمازيغية بحروف تيفيناغ أو غيرها، يمكنك المشاركة بنشر فيديو ليشاهده الجميع، فمرحبا بك معنا وبيننا.`,
  },

  // 5. إعلانات أمازيغية ترويجية
  {
    icon: Megaphone,
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
    icon: ShoppingCart,
    color: '#4531fc',
    title: 'تسوق صناعات أمازيغية',
    description: `هذا القسم خاص بتسويق الصناعات الأمازيغية التقليدية فقط، 
مثل صناعة الملابس والأقمشة والسجاد والمفروشات والأحذية والأواني الفخارية والمعدنية والخشبية، 
وغيرهم من الصناعات الأمازيغية التقليدية، ويُمنع في هذا القسم نشر أي صناعة أخرى غير الصناعة الأمازيغية الأفريقية، 
فمرحبا بك في هذا القسم ومحتواه.`,
  },

  // 7. اقتراح لتطوير تجمع الأمازيغي
  {
    icon: Lightbulb,
    color: '#4531fc',
    title: 'اقتراح لتطوير تجمع الأمازيغي',
    description: `يمكنك في هذا القسم تقديم أي اقتراح أو فكرة جميلة لمشرفي هذه المنصة الإلكترونية للتواصل الاجتماعي 
الخاصة بالأُمة الأمازيغية الأفريقية، من أجل تطويرها إلى الأفضل، أو تعديل أي قسم موجود، أو إضافة قسم جديد إليها، 
ليصبح ظهورها بشكل أجمل وأفضل لجميع مستخدميها الأمازيغ وغيرهم من ضيوفهم الكرام، 
فأهلاً بك وباقتراحك وفكرتك لنا.`,
  },

  // 8. صندوق دعم الأمازيغه
  {
    icon: Archive,
    color: '#4531fc',
    title: 'صندوق دعم الأمازيغه',
    description: `هذا الصندوق الخاص بدعم الأمازيغ بصفة خاصة وعامة، وهو صندوق يُساعد في بناء مدارس تعليمية 
أو مراكز صحية أو آبار مائية أو مُساعدة كبار السن والمرضى صحياً من أبناء وبنات الشعب الأمازيغي الأفريقي، 
والمُساهمة في دعم هذا الصندوق يكون من الشعب الأمازيغي ومن داخل الوطن فقط، 
وكل واحد يُساعد على حسب قدرته لذلك سبيل في أي وقت يُريد ذلك.`,
  },
];

const footerLinks = [
  { title: 'حول التجمع', items: ['أهداف تجمع الأمازيغ', 'لغات تجمع موقعنا', 'نبذة أهمية تراث الأمازيغ', 'برنامج أو تور تيجة الأمازيغية'] },
  { title: 'تحميل تطبيقاتنا', items: ['تحميل تطبيق للهاتف الذكي', 'تحميل ملف أيقونات للهاتف الذكي', 'تحميل تطبيق لجهاز الكمبيوتر', 'مدونة الأمازيغ'] },
  { title: 'للتواصل معنا', items: ['تواصل معنا عبر تليجرام', 'تواصل معنا عبر الواتس آب', 'تواصل معنا عبر الفيسبوك', 'دليل موقع تجمع الأمازيغ'] },
  { title: 'شعار تجمع الأمازيغ', items: ['الأمازيغية وحدتنا'] },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Introduction */}
      
        <section className="bg-white px-6 py-12">
          <h2 className="text-green-700 text-2xl font-bold mb-6">
            الأوّل - سلام - تعريف بمنصة تجمع الامازيغ
          </h2>
          <p className="text-blue-700 font-bold leading-loose text-2xl">
            تَجمُّع الامازيغ ... هي منصة تواصل اجتماعيّ تعرف بالهويّة الأمازيغية تاريخيّاً، وحضاريّاً، وثقافيّاً، وعلميّاً، وفنيّاً متنوّعاً في الماضي والحاضر ...
            مع التعريف بالقبائل والعائلات الأمازيغية وأصولهم ... وأماكن تواجدها في شمال أفريقيا والعالم.
            كما يقوم هذا التّجمُّع الأمازيغي بإحياء، وتعليم اللغة الأمازيغية بحروفها الأصليّة ومراحل تطورها عبر الزمن ...
            وندعو جميع أبناء وبنات الأمّة الأمازيغية الأفريقية حول العالم ...
            المساهمة والمشاركة معنا في إنجاح هذا التّجمُّع الأمازيغي الأفريقي العالمي على شبكة الانترنت ...
            من خلال الانضمام لهذا التّجمُّع الأمازيغي ...
            ونشر كل ما يتعلق بالامة الامازيغية الافريقية في الماضي والحاضر ...
            ودعوة الأهل والأقارب للانضمام الى هذا التّجمُّع الأمازيغي ...
            للاستفادة من محتواه الامازيغي المتنوع والجميل ...
            ويكون هذا التجمّع قاعدة بيانات ومعلومات لجميع الأمازيغ الأحرار حول العالم ...
            ولمن يُريد التعرّف على الهويّة الامازيغية الافريقية في الماضي والحاضر من اصدقاء الأمازيغ المغتربين حول العالم ...
            بإذن وتوفيق الله وحده في ذلك إن شاء الله.
          </p>

          <p className="text-red-600 font-bold text-3xl mt-2">
            الأمازيغ باقون ولن نزول إن شاء الله
          </p>

          <div className="mt-6 flex   gap-2 text-blue-700 font-bold text-3xl">
            <Map size={32} />
            <a href="#" className="hover:underline">خريطة منصة تجمع الامازيغ</a>
          </div>
        </section>

        {/* Quick-Action Buttons */}
        <section className="grid grid-cols-4 gap-4 mb-8">
          {features.slice(0, 4).map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex flex-row gap-1  items-center bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-2 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10  rounded-md flex items-center justify-center  mb-2">
                  <Icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <span className="text-base font-semibold" style={{ color: feat.color }}>
                  {feat.title}
                </span>
              </div>
            );
          })}
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.slice(4).map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col bg-gray-50 border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-start mb-2 space-x-reverse space-x-2">
                  <div className="w-8 h-8  rounded-md flex items-center justify-center ">
                    <Icon className="w-5 h-5" style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: feat.color }}>
                    {feat.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed text-right">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Call to Action */}
        <section className="bg-blue-600 flex flex-row justify-center items-center text-white p-2 rounded-md text-center mb-8">
          <h2 className="text-xl">
            سجل دخولك للتجمع مجاناً، وأستفيد من محتوياته الامازيغية المتنوعة، وادعو اهلك واصدقائك الامازيغ للانضمام لهذا التجمع للتواصل الاجتماعي الامازيغي
          </h2>
          <button className="bg-white my-auto text-blue-600 px-2 mx-3 rounded-[5px] hover:bg-gray-50 transition-colors">
            انضم إلينا
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerLinks.map((col, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-bold mb-4">{col.title}</h3>
              <ul className="space-y-2 text-sm">
                {col.items.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-green-200 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      {/* Bottom Bar */}
      <div className="bg-yellow-400 text-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <span className="bg-green-600 text-white px-3 py-1 rounded text-xs">
            حقوق الطبع والنشر محفوظة © تجمع الأمازيغ للتصميم والبرمجة 2025 - 2026
          </span>
          <div className="flex items-center space-x-reverse space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-gray-600">سياسة الخصوصية</a>
            <a href="#" className="hover:text-gray-600">سياسة الاستخدام</a>
            <a href="#" className="hover:text-gray-600">المساعدة</a>
          </div>
          <div className="flex items-center space-x-reverse space-x-2 text-xs mt-2 md:mt-0">
            <span>ⵜⵉⴼⵉⵏⴰⵖ</span>
            <span>Tamazight</span>
            <span>عربي</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </div>
  );
}
