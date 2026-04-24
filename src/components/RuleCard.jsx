const stylesByType = {
  good: "border-mint-500/35 bg-mint-100/45",
  warn: "border-amber-300/70 bg-amber-50/85",
  bad: "border-rose-300/70 bg-rose-50/85",
};

export default function RuleCard({ title, description, type = "good" }) {
  return (
    <article className={`rounded-2xl border p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.75)] ${stylesByType[type] ?? stylesByType.good}`}>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </article>
  );
}
