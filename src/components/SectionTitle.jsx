export default function SectionTitle({ eyebrow, title, description, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="mb-2 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  );
}
