import { features } from "../data/tripData";

export default function FeatureGrid() {
  return (
    <section id="inspiration" className="grid gap-5 py-16 sm:grid-cols-3">
      {features.map(([number, title, text, icon]) => (
        <article key={number} className="feature-card rounded-2xl border p-6">
          <div className="mb-12 flex justify-between text-xs font-bold text-[#9aa59d]">
            <span>{number}</span>
            <span className="text-xl text-[#ef7657]">{icon}</span>
          </div>
          <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-[#183d31]">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#77837b]">{text}</p>
        </article>
      ))}
    </section>
  );
}
