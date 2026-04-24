import PromptExampleCard from "../components/PromptExampleCard.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import {
  badExamples,
  commonMistakes,
  goodExamples,
  goodPromptFeatures,
  promptFormula,
  properFlow,
  studentPromptTemplates
} from "../data/promptData.js";

export default function PromptPage() {
  return (
    <div className="page-wrap space-y-8">
      <SectionTitle
        eyebrow="Prompt Yozish"
        title="AI bilan to'g'ri muloqot qilish madaniyati"
        description="Prompt - bu AI ga beriladigan topshiriq yoki savol. Savol qanchalik aniq bo'lsa, javob ham shunchalik foydali bo'ladi."
      />

      <section className="panel p-6">
        <h3 className="text-xl font-bold">Yaxshi prompt qanday bo'ladi?</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goodPromptFeatures.map((item) => (
            <div key={item} className="surface-soft px-3 py-3 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-bold">Prompt yozish formulasi</h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {promptFormula.map((step, index) => (
            <li key={step} className="surface-soft px-3 py-3 text-sm">
              <span className="mr-2 rounded-md bg-brand-100 px-2 py-1 font-bold text-brand-700">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-700">
          Yaxshi prompt = aniq vazifa + maqsad + foydalanuvchi darajasi + kerakli natija
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold">To'g'ri prompt namunalari</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {goodExamples.map((item) => (
            <PromptExampleCard key={item.prompt} type="good" prompt={item.prompt} explanation={item.explanation} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold">Noto'g'ri prompt namunalari</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {badExamples.map((item) => (
            <PromptExampleCard
              key={item.prompt}
              type="bad"
              prompt={item.prompt}
              explanation={item.explanation}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <h3 className="text-xl font-bold">Qanday xatolar ko'p uchraydi?</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {commonMistakes.map((item) => (
              <li key={item} className="rounded-xl bg-rose-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-6">
          <h3 className="text-xl font-bold">Prompt yozishda to'g'ri yo'l</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {properFlow.map((item) => (
              <li key={item} className="rounded-xl bg-mint-100/50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-bold">O'quvchilar uchun oddiy prompt namunalari</h3>
        <div className="mt-4 space-y-3">
          {studentPromptTemplates.map((template) => (
            <p key={template} className="surface-soft p-3 text-sm leading-6 text-slate-700">
              {template}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
