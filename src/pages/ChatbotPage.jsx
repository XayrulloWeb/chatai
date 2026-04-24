import { useEffect, useRef } from "react";
import ChatMessage from "../components/ChatMessage.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { suggestedQuestions } from "../data/chatbotData.js";
import useChatbot from "../hooks/useChatbot.js";

export default function ChatbotPage() {
  const { messages, input, setInput, isLoading, isSyncingHistory, syncError, sendMessage } = useChatbot();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="page-wrap space-y-6">
      <SectionTitle
        eyebrow="Demo Chatbot"
        title="AI bo'yicha tezkor yordamchi"
        description="Chatbot javoblari yordamchi xarakterga ega. Ularni har doim tekshirish tavsiya etiladi."
      />

      <section className="panel p-5 sm:p-6">
        <h3 className="text-lg font-bold">Tavsiya etilgan savollar</h3>
        {syncError ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {syncError}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => sendMessage(question)}
              disabled={isSyncingHistory || isLoading}
              className="rounded-xl border border-white/90 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_22px_-20px_rgba(15,23,42,0.8)] hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-700"
            >
              {question}
            </button>
          ))}
        </div>
      </section>

      <section className="panel flex h-[560px] flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/75 p-4 sm:p-5">
          {messages.map((item) => (
            <ChatMessage key={item.id} role={item.role} message={item.text} />
          ))}
          {isLoading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/90 bg-white/90 px-4 py-3 text-sm text-slate-500">
                Yozilmoqda...
              </div>
            </div>
          ) : null}
          {isSyncingHistory ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/90 bg-white/90 px-4 py-3 text-sm text-slate-500">
                Tarix yuklanmoqda...
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="border-t border-white/85 bg-white/85 p-4"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Savolingizni yozing..."
              disabled={isSyncingHistory}
              className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={isLoading || isSyncingHistory}
              className="elevated-btn h-11 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Yuborish
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
