import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isBootstrapping } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isBootstrapping, isAuthenticated, navigate, redirectPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(redirectPath, { replace: true });
    } catch (submissionError) {
      setError(submissionError.message || "Kirishda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrap">
      <section className="panel mx-auto w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Kirish</h1>
        <p className="mt-2 text-sm text-slate-600">Email va parol bilan tizimga kiring.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="you@email.com"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Parol</span>
            <input
              required
              minLength={6}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Kamida 6 ta belgi"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Hisobingiz yo&apos;qmi?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </section>
    </div>
  );
}
