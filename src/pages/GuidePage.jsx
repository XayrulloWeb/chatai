import InfoCard from "../components/InfoCard.jsx";
import RuleCard from "../components/RuleCard.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { canDo, cannotDo, classroomSupport, goodUsageRules, guideIntro, safetyRules } from "../data/guideData.js";

export default function GuidePage() {
  return (
    <div className="page-wrap space-y-8">
      <SectionTitle
        eyebrow="Qo'llanma"
        title="Sun'iy intellektdan to'g'ri foydalanish asoslari"
        description="Qisqa va tushunarli bloklar orqali AI dan qanday foyda olish va nimalardan ehtiyot bo'lish kerakligini bilib oling."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {guideIntro.map((item) => (
          <InfoCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
        ))}
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-bold">AI darsda qanday yordam beradi?</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {classroomSupport.map((item) => (
            <div key={item} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xl font-bold">AI dan to'g'ri foydalanish qoidalari</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {goodUsageRules.map((rule) => (
            <RuleCard key={rule.title} title={rule.title} description={rule.description} type="good" />
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-bold">AI dan foydalanishda ehtiyot choralari</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {safetyRules.map((item) => (
            <li key={item} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <h3 className="text-xl font-bold text-mint-500">Nima mumkin?</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {canDo.map((item) => (
              <li key={item} className="rounded-xl bg-mint-100/50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-6">
          <h3 className="text-xl font-bold text-rose-500">Nima mumkin emas?</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {cannotDo.map((item) => (
              <li key={item} className="rounded-xl bg-rose-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
