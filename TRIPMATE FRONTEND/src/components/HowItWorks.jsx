const steps = [
  [
    "01",
    "Describe the trip",
    "Share a destination, a feeling, a budget, or even a half-formed idea. TripMate starts with whatever you know.",
    "↗",
  ],
  [
    "02",
    "Let the specialists research",
    "Travel agents compare flights, stays, weather, costs, and local possibilities behind the scenes.",
    "◌",
  ],
  [
    "03",
    "Shape the route",
    "Those insights come together as a considered itinerary with a realistic rhythm and room to explore.",
    "✦",
  ],
  [
    "04",
    "Review before you go",
    "You stay in control. Approve the draft or leave a note and TripMate will rework the direction.",
    "✓",
  ],
];

export default function HowItWorks({ onNavigate }) {
  return (
    <section id="how-it-works" className="how-it-works py-16 sm:py-24">
      <div className="how-it-works-heading mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-4">A clearer way to travel</div>
          <h2 className="heading font-display text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
            From first thought
            <br />
            <span className="accent-text">to final route.</span>
          </h2>
        </div>
        <p className="muted max-w-md text-sm leading-7">
          TripMate combines practical travel research with a human sense of
          pacing, so your plan feels useful before it ever feels overfilled.
        </p>
      </div>
      <div className="how-it-works-grid grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([number, title, description, icon]) => (
          <article className="how-step p-6 sm:p-7" key={number}>
            <div className="mb-14 flex items-start justify-between">
              <span className="step-number">{number}</span>
              <span className="step-icon">{icon}</span>
            </div>
            <h3 className="heading font-display text-2xl font-bold tracking-[-0.04em]">
              {title}
            </h3>
            <p className="muted mt-3 text-sm leading-6">{description}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <a
          className="how-back-link"
          href="/#planner"
          onClick={(event) => onNavigate?.(event, "/#planner")}
        >
          <span aria-hidden="true">←</span> Back to planner
        </a>
      </div>
    </section>
  );
}
