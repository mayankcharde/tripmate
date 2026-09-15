import { useState } from "react";

export default function Header({
  user,
  onSignOut,
  darkMode,
  onToggleTheme,
  isHowItWorks = false,
  onNavigate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleNavigation = (event) =>
    onNavigate?.(event, event.currentTarget.getAttribute("href"));

  const navigateFromMenu = (event) => {
    setMenuOpen(false);
    handleNavigation(event);
  };

  return (
    <header className="relative z-50 mx-auto flex max-w-360 items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <a
        className="flex items-center gap-3 font-display text-xl font-bold tracking-[-0.04em]"
        href="/"
        onClick={handleNavigation}
      >
        <span className="brand-mark grid h-10 w-10 place-items-center rounded-2xl text-lg shadow-[0_8px_20px_rgba(24,61,49,.18)]">
          ↗
        </span>
        Trip<span className="text-[#ef7657]">Mate</span>
      </a>
      <nav className="nav-links hidden items-center gap-8 text-sm font-semibold md:flex">
        <a
          className={!isHowItWorks ? "active" : ""}
          href="/#planner"
          onClick={handleNavigation}
        >
          Plan a trip
        </a>
        <a href="/#inspiration" onClick={handleNavigation}>
          Inspiration
        </a>
        <a
          className={isHowItWorks ? "active" : ""}
          href="/how-it-works"
          onClick={handleNavigation}
        >
          How it works
        </a>
      </nav>
      <div className="flex items-center gap-3 text-sm font-bold">
        <span className="muted hidden sm:inline">Your travel copilot</span>
        <button
          type="button"
          className="theme-toggle grid h-10 w-10 place-items-center rounded-full border"
          onClick={onToggleTheme}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☼" : "☾"}
        </button>
        <span
          className="avatar grid h-10 w-10 place-items-center rounded-full border"
          title={user?.email}
        >
          {user?.name?.slice(0, 2).toUpperCase() || "TM"}
        </span>
        <button
          type="button"
          className="sign-out-button hidden md:inline"
          onClick={onSignOut}
        >
          Sign out
        </button>
        <button
          type="button"
          className="mobile-menu-button grid h-10 w-10 place-items-center rounded-xl border"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
      {menuOpen && (
        <>
          <button
            type="button"
            className="mobile-sidebar-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="mobile-sidebar" aria-label="Mobile navigation">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold">
                Trip<span className="text-[#ef7657]">Mate</span>
              </span>
              <button
                type="button"
                className="sidebar-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>
            </div>
            <p className="muted mt-3 text-sm leading-6">Your travel copilot</p>
            <nav className="mobile-sidebar-nav mt-8">
              <a
                className={!isHowItWorks ? "active" : ""}
                href="/#planner"
                onClick={navigateFromMenu}
              >
                Plan a trip <span>↗</span>
              </a>
              <a href="/#inspiration" onClick={navigateFromMenu}>
                Inspiration <span>↗</span>
              </a>
              <a
                className={isHowItWorks ? "active" : ""}
                href="/how-it-works"
                onClick={navigateFromMenu}
              >
                How it works <span>↗</span>
              </a>
            </nav>
            <button
              type="button"
              className="sidebar-theme-toggle mt-auto"
              onClick={onToggleTheme}
            >
              <span>{darkMode ? "☼" : "☾"}</span>
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
            <button
              type="button"
              className="sidebar-sign-out"
              onClick={() => {
                setMenuOpen(false);
                onSignOut?.();
              }}
            >
              <span aria-hidden="true">↪</span>
              Sign out
            </button>
          </aside>
        </>
      )}
    </header>
  );
}
