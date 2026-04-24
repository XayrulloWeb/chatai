export default function ChatMessage({ role, message }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.75)] sm:max-w-[75%] ${
          isUser
            ? "bg-gradient-to-r from-brand-500 via-[#4f7cff] to-[#00b489] text-white"
            : "border border-white/80 bg-white/90 text-slate-700"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
