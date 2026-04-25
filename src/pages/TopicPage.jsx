import { useEffect, useMemo, useState } from "react";
import SectionTitle from "../components/SectionTitle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { eduUzInformaticsBooks } from "../data/booksData.js";
import { newLessonTopic, topicGoals, topicPrinciples, topicResults, topicTasks, topicTitle } from "../data/topicData.js";
import { buildAuthApiUrl } from "../utils/authApi.js";

const motivationTexts = [
  "Har bir to'g'ri savol seni kuchliroq o'quvchiga aylantiradi.",
  "Qisqa vaqt, lekin muntazam harakat - eng kuchli strategiya.",
  "Xato bu mag'lubiyat emas, yangi usul topish signalidir.",
  "AI yordam beradi, yakuniy natijani esa sening mehnating belgilaydi.",
];

const levelRoadmap = [
  { id: "start", level: "Level 1", title: "Start", points: "0-99 XP", color: "bg-brand-50 text-brand-700" },
  { id: "izlanuvchi", level: "Level 2", title: "Izlanuvchi", points: "100-249 XP", color: "bg-mint-100/70 text-mint-500" },
  { id: "tahlilchi", level: "Level 3", title: "Tahlilchi", points: "250-449 XP", color: "bg-amber-50 text-amber-700" },
  { id: "lider", level: "Level 4", title: "Lider", points: "450+ XP", color: "bg-violet-100 text-violet-700" },
];

const fallbackTasks = [
  {
    id: "safe-link-check",
    title: "Phishing havolani aniqlang",
    description: "Xavfli xabarni tanlash orqali raqamli xavfsizlikni tekshiring.",
    question: "Qaysi holat phishing xavfi eng yuqori ekanini ko'rsatadi?",
    options: [
      { id: "a", text: "Noma'lum emaildan 'hisobni tasdiqlang' degan shoshilinch havola keladi" },
      { id: "b", text: "Maktab o'qituvchisi topshiriq faylini rasmiy guruhga joylaydi" },
      { id: "c", text: "Kutubxona saytida jadval PDF sifatida berilgan" },
      { id: "d", text: "Darslik havolasi eduportal.uz domenida ochiladi" },
    ],
    xp: 30,
    completed: false,
  },
  {
    id: "strong-password",
    title: "Kuchli parolni tanlang",
    description: "Parol xavfsizligi bo'yicha to'g'ri variantni tanlang.",
    question: "Qaysi parol eng kuchli va xavfsiz hisoblanadi?",
    options: [
      { id: "a", text: "12345678" },
      { id: "b", text: "qwerty2024" },
      { id: "c", text: "Ali2009" },
      { id: "d", text: "T9!mQ2#zL7@p" },
    ],
    xp: 40,
    completed: false,
  },
  {
    id: "prompt-quality",
    title: "Yaxshi promptni toping",
    description: "AI bilan ishlashda aniq va sifatli so'rovni ajrating.",
    question: "Quyidagilardan qaysi biri eng yaxshi prompt?",
    options: [
      { id: "a", text: "Menga hammasini aytib ber" },
      { id: "b", text: "Informatika mavzusini tushuntir" },
      { id: "c", text: "7-sinf uchun algoritm mavzusini 3 qadam bilan oddiy tilda tushuntir va 1 misol ber" },
      { id: "d", text: "Tezroq javob yoz" },
    ],
    xp: 30,
    completed: false,
  },
  {
    id: "fact-check",
    title: "Fakt tekshiruv qoidasi",
    description: "AI javobini ishonchli ishlatish uchun to'g'ri qadamni tanlang.",
    question: "AI javobidan keyingi eng to'g'ri harakat qaysi?",
    options: [
      { id: "a", text: "Javobni tekshirmasdan darhol ishlatish" },
      { id: "b", text: "Kamida 2 ishonchli manba bilan solishtirish" },
      { id: "c", text: "Faqat do'st fikrini so'rash" },
      { id: "d", text: "Faqat AIga yana bir bor savol berish" },
    ],
    xp: 25,
    completed: false,
  },
];

const fallbackBadges = [
  { id: "prompt-ustasi", title: "Prompt Ustasi", unlocked: false },
  { id: "tekshiruvchi", title: "Tekshiruvchi", unlocked: false },
  { id: "xavfsizlik-qalqoni", title: "Xavfsizlik Qalqoni", unlocked: false },
  { id: "intizom", title: "Intizom", unlocked: false },
];

const initialMotivation = {
  xp: 0,
  level: { id: "start", title: "Start", minXp: 0 },
  nextLevel: { id: "izlanuvchi", title: "Izlanuvchi", minXp: 100 },
  progressToNextLevel: 0,
  completedTaskCount: 0,
  totalTaskCount: fallbackTasks.length,
  tasks: fallbackTasks,
  badges: fallbackBadges,
};

export default function TopicPage() {
  const { token } = useAuth();
  const [motivation, setMotivation] = useState(initialMotivation);
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(true);
  const [motivationError, setMotivationError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [solvingTaskId, setSolvingTaskId] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [taskFeedbackById, setTaskFeedbackById] = useState({});

  const currentLevelId = useMemo(() => String(motivation?.level?.id || "start"), [motivation?.level?.id]);

  useEffect(() => {
    let isCurrent = true;
    if (!token) {
      setIsLoadingMotivation(false);
      return () => {
        isCurrent = false;
      };
    }

    (async () => {
      setIsLoadingMotivation(true);
      try {
        const data = await requestMotivation("/api/motivation/progress", { token });
        if (!isCurrent) return;
        setMotivation(normalizeMotivationData(data));
        setMotivationError("");
      } catch {
        if (!isCurrent) return;
        setMotivation(initialMotivation);
        setMotivationError("Motivatsiya progressini yuklashda xatolik bo'ldi.");
      } finally {
        if (isCurrent) {
          setIsLoadingMotivation(false);
        }
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [token]);

  const solveTask = async (taskId) => {
    if (!token || !taskId || solvingTaskId) {
      return;
    }

    const answerOptionId = String(selectedAnswers[taskId] || "").trim();
    if (!answerOptionId) {
      setTaskFeedbackById((prev) => ({
        ...prev,
        [taskId]: {
          type: "warn",
          message: "Avval variantni tanlang.",
        },
      }));
      return;
    }

    setSolvingTaskId(taskId);
    setActionMessage("");
    try {
      const data = await requestMotivation("/api/motivation/tasks/solve", {
        method: "POST",
        token,
        body: { taskId, answerOptionId },
      });
      setMotivation(normalizeMotivationData(data));
      setActionMessage(data?.message || "Vazifa yangilandi.");
      setTaskFeedbackById((prev) => ({
        ...prev,
        [taskId]: {
          type: data?.correct ? "success" : "error",
          message: data?.message || (data?.correct ? "To'g'ri javob." : "Noto'g'ri javob."),
        },
      }));
      setMotivationError("");
    } catch (error) {
      setMotivationError(error?.message || "Vazifani belgilashda xatolik bo'ldi.");
      setTaskFeedbackById((prev) => ({
        ...prev,
        [taskId]: {
          type: "error",
          message: error?.message || "Xatolik yuz berdi.",
        },
      }));
    } finally {
      setSolvingTaskId("");
    }
  };

  return (
    <div className="page-wrap space-y-8">
      <SectionTitle
        eyebrow="Mavzu -> Test -> Kitoblar"
        title="Mavzu, test va kitoblar yagona sahifada"
        description="Sahifa ketma-ketligi: avval mavzu, keyin test, undan so'ng kitoblar."
      />

      <section className="panel p-6">
        <p className="chip inline-flex">Asosiy mavzu</p>
        <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{topicTitle}</h2>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel p-6">
          <h3 className="text-xl font-bold">Maqsadlar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicGoals.map((item) => (
              <li key={item} className="surface-soft px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel p-6">
          <h3 className="text-xl font-bold">Asosiy vazifalar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicTasks.map((item) => (
              <li key={item} className="surface-soft px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="panel p-6">
          <h3 className="text-xl font-bold text-mint-500">Kutilayotgan natijalar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicResults.map((item) => (
              <li key={item} className="rounded-xl bg-mint-100/50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="panel p-6">
          <h3 className="text-xl font-bold">Tamoyillar</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {topicPrinciples.map((item) => (
              <li key={item} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel p-6 sm:p-7">
        <p className="chip inline-flex">Motivatsiya zonasi</p>
        <h3 className="mt-4 text-2xl font-extrabold leading-tight">Kahoot uslubidagi motivatsion tizim</h3>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
          O'quvchilar uchun kichik gamification tizimi: XP, level va badge. Maqsad - darsni qiziqarli qilish va
          "har kuni kichik progress" odatini shakllantirish.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {motivationTexts.map((text) => (
            <article key={text} className="surface-soft px-4 py-3 text-sm font-semibold text-slate-700">
              {text}
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="surface-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Jami XP</p>
            <p className="mt-2 text-2xl font-extrabold text-brand-700">{motivation.xp}</p>
          </article>
          <article className="surface-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hozirgi Level</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-800">{motivation.level?.title || "Start"}</p>
          </article>
          <article className="surface-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bajarilgan vazifa</p>
            <p className="mt-2 text-2xl font-extrabold text-mint-500">
              {motivation.completedTaskCount}/{motivation.totalTaskCount}
            </p>
          </article>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Keyingi level: {motivation.nextLevel?.title || "Maksimum"}</span>
            <span>{motivation.progressToNextLevel}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-[#4f7cff] to-[#00b489]"
              style={{ width: `${Math.max(0, Math.min(100, motivation.progressToNextLevel || 0))}%` }}
            />
          </div>
        </div>

        {isLoadingMotivation ? (
          <p className="mt-4 text-sm font-semibold text-slate-500">Progress yuklanmoqda...</p>
        ) : null}
        {actionMessage ? (
          <p className="mt-4 rounded-xl border border-mint-200 bg-mint-100/60 px-3 py-2 text-sm font-semibold text-mint-500">
            {actionMessage}
          </p>
        ) : null}
        {motivationError ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
            {motivationError}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-brand-100 bg-brand-50/70 p-5">
            <h4 className="text-lg font-extrabold text-brand-700">Level Roadmap</h4>
            <div className="mt-4 grid gap-2">
              {levelRoadmap.map((item) => (
                <div
                  key={item.level}
                  className={`surface-soft flex items-center justify-between gap-2 px-3 py-2 ${
                    currentLevelId === item.id ? "ring-2 ring-brand-500/40" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{item.level}</p>
                    <p className="text-xs font-semibold text-slate-500">{item.points}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.color}`}>{item.title}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-violet-200 bg-violet-50/70 p-5">
            <h4 className="text-lg font-extrabold text-violet-700">Badge Mission</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {motivation.badges.map((badge) => (
                <li key={badge.id} className="surface-soft flex items-center justify-between gap-2 px-3 py-2">
                  <span>{badge.title}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      badge.unlocked ? "bg-mint-100/80 text-mint-500" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {badge.unlocked ? "Ochilgan" : "Yopiq"}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-50/70 p-5">
          <h4 className="text-lg font-extrabold text-brand-700">Haftalik mini-challenge</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {motivation.tasks.map((task) => (
              <article key={task.id} className="surface-soft px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[220px] flex-1">
                    <p className="font-bold text-slate-800">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{task.description}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{task.question}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700">+{task.xp} XP</span>
                </div>

                <div className="mt-3 grid gap-2">
                  {task.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                        selectedAnswers[task.id] === option.id
                          ? "border-brand-500 bg-brand-50/70"
                          : "border-slate-200 bg-white/80"
                      } ${task.completed ? "cursor-default opacity-80" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`task-${task.id}`}
                        value={option.id}
                        checked={selectedAnswers[task.id] === option.id}
                        disabled={task.completed || solvingTaskId === task.id}
                        onChange={(event) =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [task.id]: event.target.value,
                          }))
                        }
                        className="h-4 w-4"
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={task.completed || solvingTaskId === task.id}
                    onClick={() => solveTask(task.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      task.completed
                        ? "cursor-default bg-mint-100/80 text-mint-500"
                        : "elevated-btn disabled:opacity-60"
                    }`}
                  >
                    {task.completed ? "Yechildi" : solvingTaskId === task.id ? "Tekshirilmoqda..." : "Javobni tekshirish"}
                  </button>
                  {taskFeedbackById[task.id] ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        taskFeedbackById[task.id].type === "success"
                          ? "bg-mint-100/80 text-mint-500"
                          : taskFeedbackById[task.id].type === "warn"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {taskFeedbackById[task.id].message}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm font-bold text-brand-700">
            Formula: intizom + qiziqish + tekshirish = yuqori natija.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Kitoblar"
          title="Informatika bo'yicha tavsiya etilgan darsliklar"
          description="Rasmiy manbalardagi PDF darsliklar ro'yxati (eduportal)."
        />
        <article className="panel p-5 sm:p-6">
          <p className="surface-soft px-4 py-3 text-sm text-brand-700">
            Eslatma: ayrim fayllar `old.eduportal.uz` domenida joylashgan bo'lishi mumkin. Ochilmasa keyinroq qayta urinib ko'ring.
          </p>
        </article>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      <section className="panel p-6">
        <p className="chip inline-flex">{newLessonTopic.classLevel}</p>
        <h3 className="mt-4 text-2xl font-bold leading-tight">{newLessonTopic.title}</h3>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">{newLessonTopic.description}</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="text-base font-bold">Kutiladigan ko'nikmalar</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {newLessonTopic.outcomes.map((item) => (
                <li key={item} className="surface-soft px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold">Dars jarayoni (40 daqiqa)</h4>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              {newLessonTopic.practiceSteps.map((item) => (
                <li key={item} className="surface-soft px-3 py-2">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

async function requestMotivation(path, options = {}) {
  const { method = "GET", token, body } = options;
  const response = await fetch(buildAuthApiUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(data?.message || "Motivation request failed.");
  }

  return data;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeMotivationData(data) {
  const xpRaw = Number(data?.xp);
  const xp = Number.isFinite(xpRaw) && xpRaw > 0 ? Math.floor(xpRaw) : 0;
  const level = data?.level && typeof data.level === "object" ? data.level : initialMotivation.level;
  const nextLevel = data?.nextLevel && typeof data.nextLevel === "object" ? data.nextLevel : initialMotivation.nextLevel;
  const progressToNextLevelRaw = Number(data?.progressToNextLevel);
  const progressToNextLevel =
    Number.isFinite(progressToNextLevelRaw) && progressToNextLevelRaw >= 0
      ? Math.min(100, Math.floor(progressToNextLevelRaw))
      : 0;
  const tasks = Array.isArray(data?.tasks) && data.tasks.length > 0
    ? data.tasks.map((task) => ({
        id: String(task?.id || ""),
        title: String(task?.title || ""),
        description: String(task?.description || ""),
        question: String(task?.question || ""),
        options: Array.isArray(task?.options)
          ? task.options.map((option) => ({
              id: String(option?.id || ""),
              text: String(option?.text || ""),
            }))
          : [],
        xp: Number(task?.xp) > 0 ? Number(task.xp) : 0,
        completed: Boolean(task?.completed),
      }))
    : fallbackTasks;
  const badges = Array.isArray(data?.badges) && data.badges.length > 0
    ? data.badges.map((badge) => ({
        id: String(badge?.id || ""),
        title: String(badge?.title || ""),
        unlocked: Boolean(badge?.unlocked),
      }))
    : fallbackBadges;

  return {
    xp,
    level,
    nextLevel,
    progressToNextLevel,
    completedTaskCount: Number(data?.completedTaskCount) || tasks.filter((task) => task.completed).length,
    totalTaskCount: Number(data?.totalTaskCount) || tasks.length,
    tasks,
    badges,
  };
}
