import { useState } from "react";
import SectionTitle from "../components/SectionTitle.jsx";
import SurveyQuestion from "../components/SurveyQuestion.jsx";
import { surveyQuestions } from "../data/surveyData.js";
import useLocalStorage from "../hooks/useLocalStorage.js";

export default function SurveyPage() {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useLocalStorage("ai_survey_submissions", []);

  const handleChange = (questionId, value, type, checked) => {
    setAnswers((prev) => {
      if (type === "checkbox") {
        const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        return {
          ...prev,
          [questionId]: checked ? [...current, value] : current.filter((item) => item !== value)
        };
      }

      return { ...prev, [questionId]: value };
    });

    setErrors((prev) => ({ ...prev, [questionId]: "" }));
    setSubmitted(false);
  };

  const validate = () => {
    const nextErrors = {};

    surveyQuestions.forEach((question) => {
      if (!question.required) {
        return;
      }

      const value = answers[question.id];
      const isEmptyCheckbox = question.type === "checkbox" && (!Array.isArray(value) || value.length === 0);
      const isEmptyText = question.type === "text" && !String(value ?? "").trim();
      const isEmptyRadio = question.type === "radio" && !value;

      if (isEmptyCheckbox || isEmptyText || isEmptyRadio) {
        nextErrors[question.id] = "Iltimos, bu savolga javob bering.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      answers
    };

    setSubmissions((prev) => [...prev, payload]);
    setSubmitted(true);
    setAnswers({});
  };

  return (
    <div className="page-wrap space-y-6">
      <SectionTitle
        eyebrow="So'rovnoma"
        title="5-6 sinf o'quvchilari fikri"
        description="Qisqa so'rovnoma orqali AI bo'yicha fikrlaringizni bildiring."
      />

      <section className="panel p-6">
        <p className="surface-soft inline-block px-3 py-2 text-sm text-slate-600">
          Yig'ilgan javoblar soni: <span className="font-bold text-slate-900">{submissions.length}</span>
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {surveyQuestions.map((question) => (
            <SurveyQuestion
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={handleChange}
              error={errors[question.id]}
            />
          ))}

          <button
            type="submit"
            className="elevated-btn px-5 py-3 text-sm"
          >
            Yuborish
          </button>
        </form>

        {submitted ? (
          <div className="mt-4 rounded-2xl border border-mint-500/35 bg-mint-100/55 p-4 text-sm font-semibold text-mint-500 shadow-[0_14px_24px_-20px_rgba(0,180,137,0.8)]">
            Rahmat! Sizning fikringiz biz uchun muhim.
          </div>
        ) : null}
      </section>
    </div>
  );
}
