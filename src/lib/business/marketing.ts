// Weekly marketing points (first version). Points only come from real posts in
// AnyVendor: planning a post for this week and posts the provider confirmed.

export interface PostLite {
  status: string;
  scheduled_for: string | null;
  targets: { status: string }[];
}

export const WEEKLY_GOAL = 3;
export const POINTS = { planned: 5, published: 10, goalBonus: 20 };
const COUNTS = ["scheduled", "publishing", "published", "partially_published"];

function zonedParts(utc: number, tz: string) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date(utc));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { y: +get("year"), m: +get("month"), d: +get("day"), wd: get("weekday") };
}

/** Monday of the week containing `when`, in the business's time zone, as YYYY-MM-DD. */
export function weekKey(when: Date | string | number, tz: string) {
  const { y, m, d, wd } = zonedParts(new Date(when).getTime(), tz);
  const back = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(wd);
  const monday = new Date(Date.UTC(y, m - 1, d - back));
  return monday.toISOString().slice(0, 10);
}

export interface MarketingScore {
  weekStart: string;
  planned: number;
  published: number;
  points: number;
  goal: number;
  metGoal: boolean;
  streak: number;
  totalPoints: number;
  level: "Getting started" | "Bronze" | "Silver" | "Gold";
}

function pointsFor(posts: PostLite[]) {
  const planned = posts.length;
  const published = posts.reduce((n, p) => n + p.targets.filter((t) => t.status === "published").length, 0);
  return { planned, published, points: planned * POINTS.planned + published * POINTS.published + (planned >= WEEKLY_GOAL ? POINTS.goalBonus : 0) };
}

export function marketingScore(all: PostLite[], now: Date, tz: string): MarketingScore {
  const byWeek = new Map<string, PostLite[]>();
  for (const p of all) {
    if (!p.scheduled_for || !COUNTS.includes(p.status)) continue;
    const k = weekKey(p.scheduled_for, tz);
    byWeek.set(k, [...(byWeek.get(k) ?? []), p]);
  }
  const current = weekKey(now, tz);
  const mine = pointsFor(byWeek.get(current) ?? []);
  let streak = mine.planned >= WEEKLY_GOAL ? 1 : 0;
  for (let i = 1; i <= 52; i++) {
    const k = weekKey(new Date(Date.parse(`${current}T12:00:00Z`) - i * 7 * 86400_000), tz);
    if ((byWeek.get(k)?.length ?? 0) >= WEEKLY_GOAL) streak++;
    else break;
  }
  const totalPoints = [...byWeek.values()].reduce((n, posts) => n + pointsFor(posts).points, 0);
  const level = totalPoints >= 600 ? "Gold" : totalPoints >= 300 ? "Silver" : totalPoints >= 100 ? "Bronze" : "Getting started";
  return { weekStart: current, ...mine, goal: WEEKLY_GOAL, metGoal: mine.planned >= WEEKLY_GOAL, streak, totalPoints, level };
}
