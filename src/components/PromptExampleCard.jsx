export default function PromptExampleCard({ type = "good", prompt, explanation }) {
  const isGood = type === "good";

  return (
    <article
      className={`rounded-2xl border p-5 ${
        isGood ? "border-mint-500/35 bg-mint-100/40" : "border-rose-300 bg-rose-50"
      }`}
    >
      <p className={`mb-3 inline-block rounded-lg px-2 py-1 text-xs font-bold ${isGood ? "bg-white text-mint-500" : "bg-white text-rose-500"}`}>
        {isGood ? "To'g'ri namuna" : "Noto'g'ri namuna"}
      </p>
      <p className="rounded-xl bg-white p-3 text-sm font-medium text-slate-800">"{prompt}"</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{explanation}</p>
    </article>
  );
}
