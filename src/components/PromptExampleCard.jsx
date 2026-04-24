export default function PromptExampleCard({ type = "good", prompt, explanation }) {
  const isGood = type === "good";

  return (
    <article
      className={`rounded-2xl border p-5 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.8)] ${
        isGood ? "border-mint-500/35 bg-mint-100/45" : "border-rose-300/75 bg-rose-50/90"
      }`}
    >
      <p className={`mb-3 inline-block rounded-lg border border-white/80 bg-white/85 px-2 py-1 text-xs font-bold ${isGood ? "text-mint-500" : "text-rose-500"}`}>
        {isGood ? "To'g'ri namuna" : "Noto'g'ri namuna"}
      </p>
      <p className="rounded-xl border border-white/85 bg-white/85 p-3 text-sm font-medium text-slate-800">"{prompt}"</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{explanation}</p>
    </article>
  );
}
