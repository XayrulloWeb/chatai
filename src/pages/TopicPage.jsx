import SectionTitle from "../components/SectionTitle.jsx";
import { newLessonTopic, topicGoals, topicPrinciples, topicResults, topicTasks, topicTitle } from "../data/topicData.js";

export default function TopicPage() {
  return (
    <div className="page-wrap space-y-8">
      <SectionTitle
        eyebrow="Mavzu"
        title={topicTitle}
        description="Ushbu bo'lim loyiha mavzusining maqsadi, vazifalari va kutilayotgan natijalarini tizimli ko'rinishda beradi."
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel p-6">
          <h3 className="text-xl font-bold">Maqsadlar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicGoals.map((item) => (
              <li key={item} className="surface-soft px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel p-6">
          <h3 className="text-xl font-bold">Asosiy vazifalar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicTasks.map((item) => (
              <li key={item} className="surface-soft px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel p-6">
          <h3 className="text-xl font-bold text-mint-500">Kutilayotgan natijalar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicResults.map((item) => (
              <li key={item} className="rounded-xl bg-mint-100/50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel p-6">
          <h3 className="text-xl font-bold">Tamoyillar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicPrinciples.map((item) => (
              <li key={item} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel p-6">
        <p className="chip inline-flex">{newLessonTopic.classLevel}</p>
        <h3 className="mt-4 text-2xl font-bold leading-tight">{newLessonTopic.title}</h3>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">{newLessonTopic.description}</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="text-base font-bold">Kutiladigan ko'nikmalar</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {newLessonTopic.outcomes.map((item) => (
                <li key={item} className="surface-soft px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold">Dars jarayoni (40 daqiqa)</h4>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {newLessonTopic.practiceSteps.map((item) => (
                <li key={item} className="surface-soft px-3 py-2">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
