import Footer from "./Footer";
import Header from "./Header";
import HowItWorks from "./HowItWorks";

export default function HowItWorksPage({
  darkMode,
  onToggleTheme,
  onNavigate,
}) {
  return (
    <div className="app-shell min-h-screen overflow-hidden">
      <div className="grain" />
      <Header
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        isHowItWorks
      />
      <main className="relative z-10 mx-auto max-w-360 px-5 pb-16 sm:px-8 lg:px-12">
        <HowItWorks onNavigate={onNavigate} />
      </main>
      <Footer />
    </div>
  );
}
