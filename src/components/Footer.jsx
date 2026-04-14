export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Sun'iy intellektdan to'g'ri foydalanish bo'yicha ta'limiy loyiha</p>
        <p className="font-medium text-slate-700">
          AI yordamchi, lekin inson fikrlashining o'rnini bosa olmaydi.
        </p>
      </div>
    </footer>
  );
}
