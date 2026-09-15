import { prompts } from "../data/tripData";

export default function PlannerForm({
  message,
  setMessage,
  error,
  loading,
  onSubmit,
}) {
  return (
    <section
      id="planner"
      className="planner-shell grid gap-0 overflow-hidden rounded-4xl border lg:grid-cols-[.9fr_1.1fr]"
    >
      <div className="planner-intro p-7 sm:p-10 lg:p-12">
        <div className="mb-14 flex items-center justify-between">
          <span className="rounded-full bg-[#eaf1dd] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#49684a]">
            01 / Start here
          </span>
          <span className="text-2xl text-[#ef7657]">✳</span>
        </div>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tighter text-[#183d31] sm:text-4xl">
          Where will your
          <br />
          <span className="text-[#ef7657]">curiosity take you?</span>
        </h2>
        <p className="mt-5 max-w-sm leading-7 text-[#77837b]">
          Share a rough idea, a mood, or a full brief. TripMate will turn it
          into a plan with a point of view.
        </p>
        <div className="mt-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[.14em] text-[#94a097]">
          <span className="text-xl text-[#ef7657]">✦</span> Human-approved AI
          planning
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="border-t border-[#e6e9e1] bg-[#fbfcf8] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12"
      >
        <label
          className="mb-3 block text-sm font-bold text-[#183d31]"
          htmlFor="travel-request"
        >
          Describe your ideal trip
        </label>
        <textarea
          id="travel-request"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="e.g. A relaxed 5-day food trip through Lisbon in September..."
          className="min-h-44 w-full resize-none rounded-2xl border border-[#dfe4d9] bg-white p-5 text-base leading-7 text-[#183d31] outline-none transition placeholder:text-[#aeb8af] focus:border-[#ef7657] focus:ring-4 focus:ring-[#ef7657]/10"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="rounded-full border border-[#dfe4d9] bg-white px-3 py-2 text-left text-xs font-semibold text-[#6c7770] transition hover:border-[#ef7657] hover:text-[#ef7657]"
            >
              {prompt.split(" ").slice(0, 4).join(" ")}...
            </button>
          ))}
        </div>
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-[#f3c4b6] bg-[#fff2ed] px-4 py-3 text-sm font-semibold text-[#b54f37]"
          >
            {error}
          </div>
        )}
        <button
          disabled={loading}
          aria-busy={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#183d31] px-5 py-4 font-bold text-[#f4f7df] transition hover:bg-[#255543] disabled:cursor-wait disabled:opacity-60"
          type="submit"
        >
          {loading ? (
            <>
              <span className="loading-spinner" aria-hidden="true" />
              Mapping your trip...
            </>
          ) : (
            <>
              Build my trip <span className="text-xl">↗</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
