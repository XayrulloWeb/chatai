import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import GuidePage from "./pages/GuidePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PromptPage from "./pages/PromptPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SurveyPage from "./pages/SurveyPage.jsx";
import TopicPage from "./pages/TopicPage.jsx";
import useTelegramWebAppTheme from "./hooks/useTelegramWebAppTheme.js";

function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="page-wrap">
        <section className="panel p-8 text-center text-sm font-semibold text-slate-600">
          Sessiya tekshirilmoqda...
        </section>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function GuestOnly() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="page-wrap">
        <section className="panel p-8 text-center text-sm font-semibold text-slate-600">
          Sessiya tekshirilmoqda...
        </section>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  useTelegramWebAppTheme();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/qollanma" element={<GuidePage />} />
          <Route path="/mavzu" element={<TopicPage />} />
          <Route path="/kitoblar" element={<Navigate to="/mavzu" replace />} />
          <Route path="/prompt-yozish" element={<PromptPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/sorovnoma" element={<SurveyPage />} />
        </Route>

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
