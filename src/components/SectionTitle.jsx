export default function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.15em] text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-slate-600 sm:text-lg sm:leading-8">{description}</p> : null}
    </div>
  );
}
