export default function Footer() {
  return (
    <footer className="mt-10 px-3 pb-4 sm:px-5 sm:pb-6">
      <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-white/90 bg-white/75 backdrop-blur-xl">
        <div className="flex flex-col gap-3 px-4 py-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-semibold">Sun&apos;iy intellektdan to&apos;g&apos;ri foydalanish bo&apos;yicha ta&apos;limiy loyiha</p>
          <p className="rounded-full border border-white/90 bg-white/85 px-3 py-1 font-bold text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.8)]">
            AI yordamchi, lekin inson fikrlashining o'rnini bosa olmaydi.
          </p>
        </div>
      </div>
    </footer>
  );
}
