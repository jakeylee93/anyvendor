// Update-request workflow labels and rules. Mirrors public.request_transition_allowed;
// the database enforces it.

export type RequestStatus = "received" | "in_progress" | "needs_information" | "ready_to_review" | "completed";
export type RequestScope = "standard" | "larger_feature" | "external_dependency";

export const STATUS_LABEL: Record<RequestStatus, string> = {
  received: "Received",
  in_progress: "In progress",
  needs_information: "Needs information",
  ready_to_review: "Ready to review",
  completed: "Completed",
};

export const STATUS_STYLE: Record<RequestStatus, string> = {
  received: "bg-be-mist text-be-navy",
  in_progress: "bg-be-cyan-pale text-be-navy",
  needs_information: "bg-amber-100 text-amber-900",
  ready_to_review: "bg-violet-100 text-violet-900",
  completed: "bg-emerald-100 text-emerald-900",
};

export const SCOPE_LABEL: Record<RequestScope, string | null> = {
  standard: null,
  larger_feature: "Larger feature: we’ll agree the scope with you",
  external_dependency: "Waiting on something outside our control",
};

const STAFF: [RequestStatus, RequestStatus][] = [
  ["received", "in_progress"], ["received", "needs_information"], ["received", "ready_to_review"], ["received", "completed"],
  ["in_progress", "needs_information"], ["in_progress", "ready_to_review"], ["in_progress", "completed"],
  ["needs_information", "in_progress"], ["needs_information", "completed"],
  ["ready_to_review", "in_progress"], ["ready_to_review", "completed"],
  ["completed", "in_progress"],
];
const CUSTOMER: [RequestStatus, RequestStatus][] = [
  ["needs_information", "in_progress"], ["ready_to_review", "completed"], ["ready_to_review", "in_progress"], ["completed", "in_progress"],
];

export function canTransition(actor: "staff" | "customer", from: RequestStatus, to: RequestStatus) {
  return (actor === "staff" ? STAFF : CUSTOMER).some(([f, t]) => f === from && t === to);
}

export function nextStaffMoves(from: RequestStatus): RequestStatus[] {
  return STAFF.filter(([f]) => f === from).map(([, t]) => t);
}

function span(ms: number) {
  const mins = Math.round(Math.abs(ms) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 48) return `${h}h${mins % 60 && h < 10 ? ` ${mins % 60}m` : ""}`;
  return `${Math.floor(h / 24)} days`;
}

/** Due-time label against the original 24-hour promise. Never moves the due time. */
export function dueInfo(dueAt: string, status: RequestStatus, completedAt: string | null, now = new Date()) {
  const due = new Date(dueAt).getTime();
  if (status === "completed" && completedAt) {
    const late = new Date(completedAt).getTime() - due;
    return { overdue: false, label: late > 0 ? `Completed ${span(late)} after the due time` : "Completed within 24 hours" };
  }
  const left = due - now.getTime();
  return left >= 0 ? { overdue: false, label: `Due in ${span(left)}` } : { overdue: true, label: `Overdue by ${span(left)}` };
}
