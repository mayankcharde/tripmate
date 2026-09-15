import { useEffect, useState } from "react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import FeatureGrid from "./components/FeatureGrid";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorksPage from "./components/HowItWorksPage";
import PlannerForm from "./components/PlannerForm";
import TripWorkspace from "./components/TripWorkspace";
import { getCurrentUser, logout } from "./services/authApi";
import { createTravelPlan, resumeTravelPlan } from "./services/travelApi";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.pathname);
  const [message, setMessage] = useState("");
  const [threadId, setThreadId] = useState(
    () => localStorage.getItem("travel_thread_id") || null,
  );
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("tripmate_theme") === "dark",
  );

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("tripmate_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (event, href) => {
    event?.preventDefault();
    window.history.pushState({}, "", href);
    setRoute(window.location.pathname);
    const hash = href.split("#")[1];
    if (hash) {
      window.requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }),
      );
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const signOut = async () => {
    await logout().catch(() => {});
    setUser(null);
  };

  if (authLoading) {
    return <div className="auth-loading">Preparing your TripMate...</div>;
  }

  if (!user) {
    return (
      <AuthScreen
        onAuthenticated={setUser}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
      />
    );
  }

  if (route === "/how-it-works") {
    return (
      <HowItWorksPage
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onNavigate={navigate}
      />
    );
  }

  const submitPlan = async (event) => {
    event?.preventDefault();
    const request = message.trim();
    if (!request) {
      setError(
        "Tell TripMate where you want to go and what kind of trip you have in mind.",
      );
      return;
    }
    if (plan?.requires_approval) {
      setError("Review the current draft before starting another plan.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await createTravelPlan(request, threadId);
      setThreadId(data.thread_id);
      localStorage.setItem("travel_thread_id", data.thread_id);
      setPlan(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const approvePlan = async (approved) => {
    if (!threadId) return;
    if (!approved && !feedback.trim()) {
      setError("Add a note so TripMate knows what to change.");
      return;
    }

    setApprovalLoading(true);
    setError("");
    try {
      const data = await resumeTravelPlan(threadId, approved, feedback.trim());
      setPlan(data);
      setFeedback("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen overflow-hidden">
      <div className="grain" />
      <Header
        user={user}
        onSignOut={signOut}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        onNavigate={navigate}
      />
      <main className="relative z-10 mx-auto max-w-360 px-5 pb-16 sm:px-8 lg:px-12">
        <HeroSection />
        <PlannerForm
          message={message}
          setMessage={setMessage}
          error={error}
          loading={loading}
          onSubmit={submitPlan}
        />
        <FeatureGrid />
        {plan && (
          <TripWorkspace
            plan={plan}
            feedback={feedback}
            setFeedback={setFeedback}
            approvalLoading={approvalLoading}
            onApprove={approvePlan}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
