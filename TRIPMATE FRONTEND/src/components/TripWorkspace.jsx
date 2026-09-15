import { useState } from "react";
import { agents } from "../data/tripData";

function formatAnswer(answer) {
  return answer.split(/\r?\n/).reduce((sections, line) => {
    const text = line.trim();
    if (!text) return sections;
    const isHeading = /^(#{1,3}\s|\d+[.)]\s|[A-Z][A-Z\s&-]{5,}:?$)/.test(text);
    if (isHeading) {
      sections.push({
        title: text.replace(/^#{1,3}\s*/, "").replace(/:$/, ""),
        items: [],
      });
    } else if (sections.length === 0) {
      sections.push({ title: "Your travel brief", items: [text] });
    } else {
      sections[sections.length - 1].items.push(text.replace(/^[-*•]\s*/, ""));
    }
    return sections;
  }, []);
}

export default function TripWorkspace({
  plan,
  feedback,
  setFeedback,
  approvalLoading,
  onApprove,
}) {
  const [copied, setCopied] = useState(false);
  const activeAgents = plan?.selected_agents || [];
  const answer = plan?.answer || plan?.itinerary || "";

  const copyAnswer = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const document = new jsPDF();
    const lines = document.splitTextToSize(answer, 175);
    document.setFontSize(20);
    document.text("TripMate travel plan", 17, 22);
    document.setFontSize(10);
    document.setTextColor(90, 100, 94);
    document.text(`Generated ${new Date().toLocaleDateString()}`, 17, 30);
    document.setTextColor(35, 45, 40);
    document.setFontSize(11);
    let y = 43;
    lines.forEach((line) => {
      if (y > 280) {
        document.addPage();
        y = 20;
      }
      document.text(line, 17, y);
      y += 6;
    });
    document.save("tripmate-plan.pdf");
  };

  return (
    <section className="space-y-5 pb-10" aria-live="polite">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow mb-3">02 / Your trip is taking shape</div>
          <h2 className="heading font-display text-4xl font-bold tracking-[-0.06em]">
            The route, together.
          </h2>
        </div>
        <span
          className={`status-pill rounded-full px-4 py-2 text-xs font-bold ${plan.guardrail_allowed === false ? "warning" : "success"}`}
        >
          {plan.guardrail_allowed === false
            ? "Needs a new direction"
            : "TripMate is on it"}
        </span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <div className="intelligence-panel rounded-2xl p-7">
          <div className="mb-8 flex items-center justify-between">
            <span className="panel-kicker text-xs font-bold uppercase tracking-[.15em]">
              Trip intelligence
            </span>
            <span className="text-[#e5f36d]">✦</span>
          </div>
          <p className="panel-copy text-sm leading-7">
            {plan.supervisor_reasoning ||
              "Your specialist travel team is working through the details."}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {activeAgents.map((agent) => (
              <span
                key={agent}
                className="agent-chip rounded-full border px-3 py-2 text-xs font-bold"
              >
                {agents[agent]?.[0]} {agents[agent]?.[1] || agent}
              </span>
            ))}
          </div>
        </div>
        <div className="result-panel rounded-2xl border p-7 sm:p-9">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <span className="eyebrow">
                {plan.requires_approval ? "Draft ready" : "Plan ready"}
              </span>
              <h3 className="heading mt-2 font-display text-2xl font-bold tracking-[-.04em]">
                {plan.requires_approval
                  ? "A first draft to review"
                  : "Your trip plan"}
              </h3>
            </div>
            <div className="result-actions flex items-center gap-2">
              <button
                type="button"
                className="result-action"
                onClick={copyAnswer}
                title="Copy trip plan"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                className="result-action"
                onClick={downloadPdf}
                title="Download trip plan as PDF"
              >
                PDF ↓
              </button>
            </div>
          </div>
          <div className="plan-copy">
            {formatAnswer(answer).map((section, index) => (
              <article
                className="answer-section"
                key={`${section.title}-${index}`}
              >
                <h4>{section.title}</h4>
                {section.items.map((item, itemIndex) => (
                  <p key={`${item}-${itemIndex}`}>{item}</p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </div>
      {plan.requires_approval && (
        <div className="approval-panel rounded-2xl border p-7 sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
            <div>
              <div className="eyebrow text-[#b54f37]">03 / Make it yours</div>
              <h3 className="heading mt-2 font-display text-2xl font-bold tracking-[-.04em]">
                {plan.approval_request || "Does this direction feel right?"}
              </h3>
              <p className="muted mt-2 text-sm leading-6">
                Approve it to finish, or leave a note and we will rework the
                route.
              </p>
            </div>
            <div>
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Optional: tell us what to change..."
                className="feedback-input h-24 w-full resize-none rounded-xl border p-4 text-sm outline-none"
              />
              <div className="mt-3 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={approvalLoading}
                  aria-busy={approvalLoading}
                  onClick={() => onApprove(false)}
                  className="revise-button rounded-xl border px-5 py-3 text-sm font-bold disabled:opacity-50"
                >
                  {approvalLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="loading-spinner" aria-hidden="true" />
                      Reworking...
                    </span>
                  ) : (
                    "Revise draft"
                  )}
                </button>
                <button
                  type="button"
                  disabled={approvalLoading}
                  aria-busy={approvalLoading}
                  onClick={() => onApprove(true)}
                  className="primary-button rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50"
                >
                  {approvalLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="loading-spinner" aria-hidden="true" />
                      Finishing...
                    </span>
                  ) : (
                    "Approve & finish ↗"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
