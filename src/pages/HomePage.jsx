import HeroSection from "../components/HeroSection.jsx";
import InfoCard from "../components/InfoCard.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { aiNeedReasons, homeBenefits } from "../data/homeData.js";

export default function HomePage() {
  return (
    <div className="page-wrap space-y-8">
      <HeroSection />

      <section className="space-y-5">
        <SectionTitle
          eyebrow="Afzalliklar"
          title="Platformaning asosiy foydalari"
          description="O'quvchi va o'qituvchilar uchun AI dan samarali foydalanishni soddalashtiradi."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeBenefits.map((benefit) => (
            <InfoCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <h3 className="text-xl font-bold">AI nima uchun kerak?</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700 sm:text-base">
            {aiNeedReasons.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-6">
          <h3 className="text-xl font-bold">Eng muhim qoida</h3>
          <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-base font-semibold text-brand-700">
            AI bilan ishlashda eng muhim qoida: javobni tekshir, tushun, keyin ishlat.
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Bu yondashuv tanqidiy fikrlashni rivojlantiradi va noto'g'ri ma'lumotdan himoya qiladi.
          </p>
        </div>
      </section>
    </div>
  );
}
