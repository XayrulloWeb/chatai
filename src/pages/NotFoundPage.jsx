import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page-wrap">
      <section className="panel p-8 text-center">
        <h1 className="text-3xl font-bold">Sahifa topilmadi</h1>
        <p className="mt-3 text-slate-600">Kechirasiz, siz qidirayotgan sahifa mavjud emas.</p>
        <Link
          to="/"
          className="elevated-btn mt-6 inline-block px-5 py-3 text-sm"
        >
          Bosh sahifaga qaytish
        </Link>
      </section>
    </main>
  );
}
