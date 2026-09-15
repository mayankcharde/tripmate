export default function HeroSection() {
  return (
    <section className="hero-grid grid items-end gap-10 pb-12 pt-14 lg:grid-cols-[1.15fr_.85fr] lg:pt-24">
      <div className="max-w-3xl">
        <div className="eyebrow mb-6">
          <span className="pulse-dot" /> AI-POWERED TRAVEL PLANNING
        </div>
        <h1 className="heading font-display text-5xl font-bold leading-[.94] tracking-[-0.07em] sm:text-7xl lg:text-[6.6rem]">
          Go somewhere
          <br />
          <em className="text-[#ef7657]">worth remembering.</em>
        </h1>
        <p className="muted mt-7 max-w-xl text-lg leading-8">
          Your thoughtful travel companion for finding the right places, shaping
          better days, and leaving room for the unexpected.
        </p>
      </div>
      <div className="hidden justify-end lg:flex">
        <div className="route-sketch" aria-hidden="true">
          <span>✈</span>
          <div className="route-line" />
          <b>
            your next
            <br />
            chapter
          </b>
        </div>
      </div>
    </section>
  );
}
