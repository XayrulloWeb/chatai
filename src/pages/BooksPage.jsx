import SectionTitle from "../components/SectionTitle.jsx";
import { eduUzInformaticsBooks } from "../data/booksData.js";

export default function BooksPage() {
  return (
    <div className="page-wrap space-y-8">
      <SectionTitle
        eyebrow="Edu.uz / Eduportal"
        title="Informatika bo'yicha tavsiya etilgan darsliklar"
        description="Quyidagi ro'yxatda informatika fanidan real PDF darsliklar berilgan. Havolalar eduportal (XTV axborot-ta'lim resurslari) manbalariga olib boradi."
      />

      <section className="panel p-5 sm:p-6">
        <p className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-brand-700">
          Eslatma: ayrim darsliklar old.eduportal.uz domenida joylashgan. Agar ochilmasa, keyinroq qayta urinib ko'ring yoki brauzerda to'g'ridan-to'g'ri oching.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eduUzInformaticsBooks.map((book) => (
          <article key={book.id} className="panel flex flex-col p-5">
            <span className="chip inline-flex w-fit">{book.className}</span>
            <h3 className="mt-4 text-lg font-bold leading-tight">{book.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{book.description}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{book.sourceLabel}</p>
            <a
              href={book.url}
              target="_blank"
              rel="noreferrer noopener"
              className="elevated-btn mt-4 inline-flex w-fit items-center px-4 py-2 text-sm"
            >
              PDF ochish
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
