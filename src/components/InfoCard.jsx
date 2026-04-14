export default function InfoCard({ icon, title, description, items = [] }) {
  return (
    <article className="panel p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
