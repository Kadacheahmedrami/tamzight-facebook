import { NextResponse } from "next/server"

export async function GET() {
  const supportInfo = {
    definition: {
      title: "تعريف بصندوق دعم الامازيغ",
      content:
        "صندوق دعم الأمازيغ هو مبادرة خيرية تهدف إلى توفير الدعم المالي والمعنوي للمحتاجين من الأمازيغ في مختلف المجالات التعليمية والصحية والاجتماعية.",
      established: "2020",
      beneficiaries: "15000+",
      projects: "250+",
    },
    goals: [
      "توفير الدعم المالي للطلاب الأمازيغ المتفوقين",
      "المساهمة في بناء المدارس والمراكز التعليمية في المناطق النائية",
      "تقديم المساعدات الطبية والعلاجية للمرضى المحتاجين",
      "دعم المشاريع الصغيرة والمتوسطة للأسر الأمازيغية",
      "الحفاظ على التراث والثقافة الأمازيغية",
      "تطوير البرامج التعليمية للغة الأمازيغية",
    ],
    howToSupport: [
      {
        method: "التبرع المباشر",
        description: "يمكنك التبرع مباشرة عبر حساباتنا البنكية المعتمدة",
        account: "البنك الشعبي: 123456789",
      },
      {
        method: "التطوع",
        description: "انضم لفريق المتطوعين لتقديم الخدمات المجتمعية",
        contact: "volunteers@amazigh-support.org",
      },
      {
        method: "نشر الوعي",
        description: "ساعدنا في نشر رسالتنا وأهدافنا عبر وسائل التواصل",
        hashtag: "#دعم_الامازيغ",
      },
    ],
    statistics: {
      totalDonations: "2,500,000 درهم",
      studentsSupported: "1,200 طالب",
      schoolsBuilt: "15 مدرسة",
      medicalCases: "800 حالة",
      familiesSupported: "3,000 أسرة",
    },
  }

  return NextResponse.json(supportInfo)
}
