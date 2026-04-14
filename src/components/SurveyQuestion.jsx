export default function SurveyQuestion({ question, value, onChange, error }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="font-semibold text-slate-900">
        {question.label}
        {question.required ? <span className="ml-1 text-rose-500">*</span> : null}
      </p>

      <div className="mt-3 space-y-2">
        {question.type === "radio"
          ? question.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50">
                <input
                  type="radio"
                  name={question.id}
                  checked={value === option}
                  onChange={() => onChange(question.id, option, "radio")}
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-700">{option}</span>
              </label>
            ))
          : null}

        {question.type === "checkbox"
          ? question.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(event) => onChange(question.id, option, "checkbox", event.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-700">{option}</span>
              </label>
            ))
          : null}

        {question.type === "text" ? (
          <input
            type="text"
            value={value ?? ""}
            onChange={(event) => onChange(question.id, event.target.value, "text")}
            placeholder={question.placeholder}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500"
          />
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
    </div>
  );
}
