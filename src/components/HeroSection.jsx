export default function HeroSection() {
  return (
    <section className="panel relative overflow-hidden p-0">
      <div className="relative h-[280px] sm:h-[330px] lg:h-[360px]">
        <img
          src="/image.png"
          alt="AI Qo'llanma banner"
          className="h-full w-full object-cover saturate-110"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/40 to-slate-900/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <span className="inline-flex items-center rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
            AI learning platform
          </span>
          <h1 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-4xl">
            Sun&apos;iy intellektni darsda amaliy va xavfsiz qo&apos;llash
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            O&apos;quvchilar uchun tushunarli yo&apos;riqnoma, prompt namunalari va interaktiv chatbot bir joyda.
          </p>
        </div>
      </div>
    </section>
  );
}
