const stylesByType = {
  good: "border-mint-500/40 bg-mint-100/45",
  warn: "border-amber-300 bg-amber-50",
  bad: "border-rose-300 bg-rose-50",
};

export default function RuleCard({ title, description, type = "good" }) {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${stylesByType[type] ?? stylesByType.good}`}>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </article>
  );
}
