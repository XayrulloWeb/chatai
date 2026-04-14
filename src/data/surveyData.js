export const surveyQuestions = [
  {
    id: "heard_ai",
    type: "radio",
    required: true,
    label: "1. Siz sun'iy intellekt haqida oldin eshitganmisiz?",
    options: ["Ha", "Yo'q", "Biroz eshitganman"]
  },
  {
    id: "interest_ai",
    type: "radio",
    required: true,
    label: "2. AI bilan ishlash sizga qiziq tuyuladimi?",
    options: ["Ha, juda qiziq", "Biroz qiziq", "Hali ishonchim komil emas"]
  },
  {
    id: "ai_in_class",
    type: "radio",
    required: true,
    label: "3. Darsda AI yordam bersa yaxshi bo'ladimi?",
    options: ["Ha, foydali bo'ladi", "Ba'zi darslarda", "Yo'q, kerak emas"]
  },
  {
    id: "usage_purpose",
    type: "checkbox",
    required: true,
    label: "4. Siz AI dan ko'proq nima uchun foydalanishni xohlaysiz?",
    options: ["Mavzuni tushunish", "Testga tayyorlanish", "Koddagi xatoni tushunish", "Yangi g'oya olish"]
  },
  {
    id: "learn_prompt",
    type: "radio",
    required: true,
    label: "5. Prompt yozishni o'rganish foydali deb o'ylaysizmi?",
    options: ["Ha, albatta", "Balki", "Yo'q"]
  },
  {
    id: "verify_ai",
    type: "radio",
    required: true,
    label: "6. AI javobini tekshirish kerak deb o'ylaysizmi?",
    options: ["Ha, har doim", "Ba'zida", "Yo'q"]
  },
  {
    id: "favorite_section",
    type: "text",
    required: true,
    label: "7. Sizga saytning qaysi qismi ko'proq yoqdi?",
    placeholder: "Masalan: Prompt yozish bo'limi"
  }
];
