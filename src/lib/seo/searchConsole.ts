// Google Search Console Search Analytics (webmasters v3). Fetch-injected for tests.

export interface SeoSummary {
  periodStart: string;
  periodEnd: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
  topQueries: { query: string; clicks: number; impressions: number }[];
}

const day = (d: Date) => d.toISOString().slice(0, 10);

/** Last 28 days, ending 3 days ago because Google's data lags 2–3 days. */
export function reportWindow(now = new Date()) {
  const end = new Date(now.getTime() - 3 * 86400_000);
  const start = new Date(end.getTime() - 27 * 86400_000);
  return { startDate: day(start), endDate: day(end) };
}

export async function fetchSummary(token: string, siteUrl: string, f: typeof fetch = fetch, now = new Date()): Promise<SeoSummary> {
  const { startDate, endDate } = reportWindow(now);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const post = (body: object) => f(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const [totalRes, queryRes] = await Promise.all([
    post({ startDate, endDate, type: "web", dataState: "final" }),
    post({ startDate, endDate, type: "web", dimensions: ["query"], rowLimit: 10, dataState: "final" }),
  ]);
  if (totalRes.status === 401 || totalRes.status === 403) throw Object.assign(new Error("auth"), { auth: true });
  if (!totalRes.ok || !queryRes.ok) throw new Error(`Search Console query failed (${totalRes.status}/${queryRes.status})`);
  const total = (await totalRes.json()).rows?.[0];
  const queries = (await queryRes.json()).rows ?? [];
  return {
    periodStart: startDate,
    periodEnd: endDate,
    clicks: total?.clicks ?? 0,
    impressions: total?.impressions ?? 0,
    ctr: total?.ctr ?? 0,
    position: total?.position ?? null,
    topQueries: queries.map((r: { keys: string[]; clicks: number; impressions: number }) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
  };
}
