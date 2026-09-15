const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "TripMate could not complete this request.");
  }

  return data;
}

export function createTravelPlan(message, threadId) {
  return request("/api/travel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });
}

export function resumeTravelPlan(threadId, approved, feedback) {
  return request("/api/travel/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, approved, feedback }),
  });
}
