export default function ChatMessage({ role, message }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[75%] ${
          isUser ? "bg-brand-500 text-white" : "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
