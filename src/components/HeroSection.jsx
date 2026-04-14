import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="panel relative overflow-hidden p-6 sm:p-10">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand-100 blur-2xl" />
      <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-mint-100 blur-2xl" />
      <div className="relative">
        <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          Ta'limiy platforma
        </p>
        <h1 className="max-w-4xl text-3xl font-extrabold sm:text-5xl">
          Sun'iy intellektdan to'g'ri, xavfsiz va samarali foydalanish qo'llanmasi
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          Ushbu platforma o'quvchilar va o'qituvchilarga AI dan mas'uliyatli foydalanishni o'rgatadi:
          prompt yozish, javobni tekshirish va tanqidiy fikrlashni kuchaytirish.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/qollanma"
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Qo'llanmani ochish
          </Link>
          <Link
            to="/prompt-yozish"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            Prompt yozishni o'rganish
          </Link>
          <Link
            to="/chatbot"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            Demo chatbot
          </Link>
        </div>
      </div>
    </section>
  );
}
