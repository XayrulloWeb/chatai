export const suggestedQuestions = [
  "AI nima?",
  "Prompt qanday yoziladi?",
  "AI dan xavfsiz foydalanish nima?",
  "Nega AI javobini tekshirish kerak?",
  "Darsda AI qanday yordam beradi?"
];

const keywordResponses = [
  {
    keywords: ["ai nima", "sun'iy intellekt nima", "suniy intellekt nima"],
    response:
      "Sun'iy intellekt bu savollarga javob beradigan va ma'lumot bilan ishlashga yordam beradigan dasturiy texnologiya. U yordamchi vosita, lekin har doim ham mukammal emas."
  },
  {
    keywords: ["qanday foydalanish", "ai dan qanday foydalanish", "to'g'ri foydalanish"],
    response:
      "AI dan to'g'ri foydalanish uchun avval maqsadni aniq belgilang, keyin savolni tushunarli yozing va olingan javobni albatta tekshiring."
  },
  {
    keywords: ["prompt nima", "prompt qanday", "prompt"],
    response:
      "Prompt bu AI ga beriladigan topshiriq yoki savol. Prompt qanchalik aniq bo'lsa, javob ham shunchalik foydali bo'ladi."
  },
  {
    keywords: ["yaxshi prompt", "prompt qanday yoziladi", "to'g'ri prompt"],
    response:
      "Yaxshi promptda mavzu, maqsad, kim uchun ekanligi, format va til ko'rsatiladi. Masalan: 6-sinf uchun AI haqida 5 gap yoz."
  },
  {
    keywords: ["tekshirish kerak", "nega tekshirish", "javobni tekshir"],
    response:
      "AI ba'zan xato yoki to'liq bo'lmagan javob berishi mumkin. Shu sababli javobni darslik, o'qituvchi yoki ishonchli manbalar bilan tekshirish juda muhim."
  },
  {
    keywords: ["darsda yordam", "darsda ai", "informatika"],
    response:
      "AI darsda mavzuni oddiy tushuntirish, test savollari tuzish, koddagi xatoni tushuntirish va yangi g'oyalar topishda yordam beradi."
  },
  {
    keywords: ["qachon foydalanmaslik", "nima mumkin emas", "imtihon"],
    response:
      "Uy vazifasini to'liq AI ga topshirish, imtihonda noqonuniy foydalanish yoki tekshirmasdan javobni qabul qilish noto'g'ri hisoblanadi."
  },
  {
    keywords: ["xavfsiz foydalanish", "xavfsizlik", "shaxsiy ma'lumot"],
    response:
      "Shaxsiy ma'lumotlarni yubormang: parol, telefon raqami, manzil kabi ma'lumotlarni kiritmang. Har doim xavfsizlikni birinchi o'ringa qo'ying."
  }
];

export function resolveDemoResponse(input) {
  const cleanInput = input.trim().toLowerCase();
  const matched = keywordResponses.find((item) =>
    item.keywords.some((keyword) => cleanInput.includes(keyword))
  );

  if (matched) {
    return matched.response;
  }

  return "Savolingiz uchun rahmat. Iltimos, savolni biroz aniqroq yozing: masalan, 'Prompt qanday yoziladi?' yoki 'AI javobini nega tekshirish kerak?'";
}
