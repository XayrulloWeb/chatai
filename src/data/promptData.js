export const goodPromptFeatures = [
  "Aniq",
  "Qisqa, lekin mazmunli",
  "Maqsadi tushunarli",
  "Kerakli mavzu ko'rsatilgan",
  "Sinf yoki daraja ko'rsatilgan",
  "Natija qanday bo'lishi aytilgan"
];

export const promptFormula = [
  "Mavzu",
  "Maqsad",
  "Kim uchun",
  "Qanday formatda",
  "Qancha uzunlikda",
  "Qaysi tilda"
];

export const goodExamples = [
  {
    prompt: "Menga 6-sinf o'quvchilari uchun AI haqida sodda tilda 5 ta gap yoz.",
    explanation: "Mavzu, auditoriya va javob uzunligi aniq berilgan."
  },
  {
    prompt: "Python haqida boshlang'ich darajadagi o'quvchi uchun oddiy misol keltir.",
    explanation: "Daraja ko'rsatilgan, natija turi tushunarli."
  },
  {
    prompt: "Ushbu mavzuni bolalar tushunadigan tilda qisqacha tushuntir.",
    explanation: "Til va uslub aniq belgilangan."
  },
  {
    prompt: "Menga informatika darsi uchun 5 ta test savoli tuz.",
    explanation: "Aniq maqsad va natija soni bor."
  },
  {
    prompt: "Kodimdagi xatoni tushuntir, lekin tayyor javobni to'liq berma.",
    explanation: "AI dan yordam olish maqsadi to'g'ri qo'yilgan."
  }
];

export const badExamples = [
  { prompt: "Biror narsa yoz.", explanation: "Juda umumiy, mavzu noma'lum." },
  { prompt: "Tezroq qil.", explanation: "Natija mazmuni haqida hech narsa aytilmagan." },
  { prompt: "Hammasini qil.", explanation: "Vazifa noaniq va chegaralanmagan." },
  { prompt: "Menga ideal javob ber.", explanation: "Ideal nimani anglatishi ko'rsatilmagan." },
  { prompt: "Kod yozib ber.", explanation: "Til, mavzu, daraja va maqsad ko'rsatilmagan." },
  { prompt: "Uy vazifamni to'liq bajarib ber.", explanation: "Bu noto'g'ri va o'rganishga zararli yondashuv." }
];

export const commonMistakes = [
  "Juda umumiy yozish",
  "Mavzuni ko'rsatmaslik",
  "Maqsadni aytmaslik",
  "Sinf yoki yoshni ko'rsatmaslik",
  "Formatni aytmaslik",
  "Javobni tekshirmaslik",
  "Faqat tayyor javob olishga urinish"
];

export const properFlow = [
  "Avval maqsadni aniqlash",
  "Savolni aniq yozish",
  "Tushunmagan joyga qo'shimcha savol berish",
  "Natijani qayta ishlash",
  "Tekshirish",
  "O'zingiz ham fikr qo'shish"
];

export const studentPromptTemplates = [
  "Menga 5-sinf o'quvchisi uchun sun'iy intellekt haqida oddiy va qisqa tushuntirish yozib ber. Matn o'zbek tilida bo'lsin va 5 ta gapdan oshmasin.",
  "Menga informatika fanidan algoritm mavzusida 5 ta sodda test savoli tayyorla.",
  "Ushbu matnni 6-sinf o'quvchisi tushunadigan darajada soddalashtir.",
  "Men yozgan koddagi xatoni bosqichma-bosqich tushuntir, lekin tayyor yechimni to'liq bermagin."
];
