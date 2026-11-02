// Provider registry and adapters for businesses' OWN accounts. Official endpoints are
// recorded in docs/backend/PROVIDERS-20261102.md. Everything that talks to a provider
// takes a fetch implementation so it can be tested without network access.

export type SocialProvider = "linkedin" | "instagram";
export type ProviderKey = SocialProvider | "google_search_console";

export interface MediaItem {
  path: string;
  mime: string;
  bytes: number;
  kind: "image" | "video";
}

export const LINKEDIN_VERSION = "202610";
export const GRAPH_VERSION = "v26.0";

export const PROVIDERS: Record<ProviderKey, { label: string; module: "social" | "seo"; env: [string, string] }> = {
  linkedin: { label: "LinkedIn", module: "social", env: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"] },
  instagram: { label: "Instagram", module: "social", env: ["INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET"] },
  google_search_console: { label: "Google Search Console", module: "seo", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
};

export const LIMITS = {
  linkedin: { maxChars: 3000, maxMedia: 1, image: ["image/jpeg", "image/png", "image/gif"], video: false, requiresMedia: false },
  instagram: { maxChars: 2200, maxMedia: 10, image: ["image/jpeg"], video: true, requiresMedia: true, maxHashtags: 30, maxImageBytes: 8 * 1024 * 1024 },
};

/** Problems that would stop a post publishing on that provider, in plain English. */
export function validateForProvider(p: SocialProvider, body: string, media: MediaItem[]): string[] {
  const out: string[] = [];
  const l = LIMITS[p];
  if (body.length > l.maxChars) out.push(`${p === "linkedin" ? "LinkedIn" : "Instagram"} allows ${l.maxChars} characters.`);
  if (media.length > l.maxMedia) out.push(p === "linkedin" ? "LinkedIn posts here can have one image." : "Instagram allows up to 10 items.");
  if (p === "linkedin") {
    if (!body.trim() && media.length === 0) out.push("Add some text or an image for LinkedIn.");
    if (media.some((m) => m.kind === "video")) out.push("Video to LinkedIn isn’t supported yet.");
    if (media.some((m) => m.kind === "image" && !LIMITS.linkedin.image.includes(m.mime))) out.push("LinkedIn images must be JPG, PNG or GIF.");
  } else {
    if (media.length === 0) out.push("Instagram needs a photo or video.");
    if (media.some((m) => m.kind === "image" && m.mime !== "image/jpeg")) out.push("Instagram photos must be JPEG.");
    if (media.some((m) => m.kind === "image" && m.bytes > LIMITS.instagram.maxImageBytes)) out.push("Instagram photos must be 8 MB or smaller.");
    if (media.some((m) => m.kind === "video") && media.length > 1) out.push("Post an Instagram video on its own.");
    if ((body.match(/#[\p{L}\p{N}_]+/gu) ?? []).length > 30) out.push("Instagram allows 30 hashtags.");
  }
  return out;
}

/** LinkedIn "little" text format: these characters must be backslash-escaped. */
export function escapeLinkedIn(text: string) {
  return text.replace(/[|{}@[\]()<>#\\*_~]/g, (c) => `\\${c}`);
}

export function authorizeUrl(p: ProviderKey, o: { clientId: string; redirectUri: string; state: string; codeChallenge?: string }) {
  if (p === "linkedin") {
    return `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({ response_type: "code", client_id: o.clientId, redirect_uri: o.redirectUri, state: o.state, scope: "openid profile w_member_social" })}`;
  }
  if (p === "instagram") {
    return `https://www.instagram.com/oauth/authorize?${new URLSearchParams({ client_id: o.clientId, redirect_uri: o.redirectUri, response_type: "code", scope: "instagram_business_basic,instagram_business_content_publish", state: o.state })}`;
  }
  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: o.clientId, redirect_uri: o.redirectUri, response_type: "code", scope: "https://www.googleapis.com/auth/webmasters.readonly",
    access_type: "offline", prompt: "consent", include_granted_scopes: "true", state: o.state,
    ...(o.codeChallenge ? { code_challenge: o.codeChallenge, code_challenge_method: "S256" } : {}),
  })}`;
}

export interface Connected {
  accountId: string;
  displayName: string;
  accountType: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  scopes: string[];
  settings: Record<string, unknown>;
}

type Fetch = typeof fetch;
const form = (o: Record<string, string>) => ({ method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(o).toString() });
const inSeconds = (s: number | undefined) => (s ? new Date(Date.now() + s * 1000).toISOString() : null);

async function json(res: Response, what: string) {
  const text = await res.text();
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return text ? JSON.parse(text) : {};
}

export async function exchangeCode(
  p: ProviderKey,
  o: { code: string; clientId: string; clientSecret: string; redirectUri: string; verifier?: string },
  f: Fetch = fetch,
): Promise<Connected> {
  if (p === "linkedin") {
    const t = await json(await f("https://www.linkedin.com/oauth/v2/accessToken", form({ grant_type: "authorization_code", code: o.code, client_id: o.clientId, client_secret: o.clientSecret, redirect_uri: o.redirectUri })), "LinkedIn token");
    const me = await json(await f("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${t.access_token}` } }), "LinkedIn profile");
    return { accountId: `urn:li:person:${me.sub}`, displayName: me.name ?? "LinkedIn member", accountType: "member", accessToken: t.access_token, refreshToken: null, expiresAt: inSeconds(t.expires_in), scopes: String(t.scope ?? "").split(/[ ,]/).filter(Boolean), settings: {} };
  }
  if (p === "instagram") {
    const raw = await json(await f("https://api.instagram.com/oauth/access_token", form({ client_id: o.clientId, client_secret: o.clientSecret, grant_type: "authorization_code", redirect_uri: o.redirectUri, code: o.code })), "Instagram token");
    const short = Array.isArray(raw.data) ? raw.data[0] : raw;
    const long = await json(await f(`https://graph.instagram.com/access_token?${new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: o.clientSecret, access_token: short.access_token })}`), "Instagram long-lived token");
    const me = await json(await f(`https://graph.instagram.com/${GRAPH_VERSION}/me?fields=user_id,username,account_type`, { headers: { Authorization: `Bearer ${long.access_token}` } }), "Instagram profile");
    const perms = Array.isArray(short.permissions) ? short.permissions : String(short.permissions ?? "").split(",");
    return { accountId: String(me.user_id ?? short.user_id), displayName: me.username ? `@${me.username}` : "Instagram account", accountType: me.account_type ?? null, accessToken: long.access_token, refreshToken: null, expiresAt: inSeconds(long.expires_in), scopes: perms.filter(Boolean), settings: { tokenIssuedAt: new Date().toISOString() } };
  }
  const t = await json(await f("https://oauth2.googleapis.com/token", form({ code: o.code, client_id: o.clientId, client_secret: o.clientSecret, redirect_uri: o.redirectUri, grant_type: "authorization_code", ...(o.verifier ? { code_verifier: o.verifier } : {}) })), "Google token");
  const sites = await json(await f("https://www.googleapis.com/webmasters/v3/sites", { headers: { Authorization: `Bearer ${t.access_token}` } }), "Search Console sites");
  const usable = (sites.siteEntry ?? []).filter((s: { permissionLevel: string }) => s.permissionLevel !== "siteUnverifiedUser").map((s: { siteUrl: string }) => s.siteUrl);
  return { accountId: `google:${usable.join("|").slice(0, 200) || "no-sites"}`, displayName: usable[0] ?? "No verified sites", accountType: "search_console", accessToken: t.access_token, refreshToken: t.refresh_token ?? null, expiresAt: inSeconds(t.expires_in), scopes: String(t.scope ?? "").split(" ").filter(Boolean), settings: { sites: usable, site: usable[0] ?? null } };
}

export async function refreshGoogle(refreshToken: string, clientId: string, clientSecret: string, f: Fetch = fetch) {
  const t = await json(await f("https://oauth2.googleapis.com/token", form({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret })), "Google refresh");
  return { accessToken: t.access_token as string, expiresAt: inSeconds(t.expires_in) };
}

export async function refreshInstagram(token: string, f: Fetch = fetch) {
  const t = await json(await f(`https://graph.instagram.com/refresh_access_token?${new URLSearchParams({ grant_type: "ig_refresh_token", access_token: token })}`), "Instagram refresh");
  return { accessToken: t.access_token as string, expiresAt: inSeconds(t.expires_in) };
}

// ------------------------------------------------------------------ publishing
export type PublishOutcome = {
  outcome: "published" | "retryable_error" | "permanent_error" | "auth_error";
  externalId?: string;
  externalUrl?: string;
  containerId?: string;
  error?: string;
};

const UNKNOWN = "The provider didn’t confirm whether this posted. Check the account before posting again.";

/** For calls that create a post: only clear refusals are retried; anything ambiguous is never retried. */
function classifyCreate(status: number, provider: string): PublishOutcome {
  if (status === 401 || status === 403) return { outcome: "auth_error", error: `${provider} refused the token. Reconnect the account.` };
  if (status === 429) return { outcome: "retryable_error", error: `${provider} rate limit reached; trying again shortly.` };
  if (status >= 400 && status < 500) return { outcome: "permanent_error", error: `${provider} rejected the post (${status}).` };
  return { outcome: "permanent_error", error: UNKNOWN };
}

export async function publishLinkedIn(
  o: { token: string; author: string; text: string; image?: { data: ArrayBuffer | Blob; mime: string; alt?: string } },
  f: Fetch = fetch,
): Promise<PublishOutcome> {
  const h = { Authorization: `Bearer ${o.token}`, "Linkedin-Version": LINKEDIN_VERSION, "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" };
  let mediaId: string | null = null;
  if (o.image) {
    const init = await f("https://api.linkedin.com/rest/images?action=initializeUpload", { method: "POST", headers: h, body: JSON.stringify({ initializeUploadRequest: { owner: o.author } }) });
    if (!init.ok) return init.status === 401 ? classifyCreate(401, "LinkedIn") : { outcome: init.status === 429 || init.status >= 500 ? "retryable_error" : "permanent_error", error: `LinkedIn image upload could not start (${init.status}).` };
    const v = (await init.json()).value;
    const put = await f(v.uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${o.token}`, "Content-Type": o.image.mime }, body: o.image.data as BodyInit });
    if (!put.ok) return { outcome: put.status >= 500 || put.status === 429 ? "retryable_error" : "permanent_error", error: `LinkedIn image upload failed (${put.status}).` };
    mediaId = v.image;
  }
  let res: Response;
  try {
    res = await f("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        author: o.author,
        commentary: escapeLinkedIn(o.text),
        visibility: "PUBLIC",
        distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
        ...(mediaId ? { content: { media: { id: mediaId, altText: o.image?.alt ?? "" } } } : {}),
      }),
    });
  } catch {
    return { outcome: "permanent_error", error: UNKNOWN };
  }
  if (res.status !== 201) return classifyCreate(res.status, "LinkedIn");
  const id = res.headers.get("x-restli-id") ?? undefined;
  return { outcome: "published", externalId: id, externalUrl: id ? `https://www.linkedin.com/feed/update/${id}/` : undefined };
}

export async function publishInstagram(
  o: { token: string; igUserId: string; caption: string; media: { url: string; kind: "image" | "video" }[]; existingContainer?: string | null },
  f: Fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<PublishOutcome> {
  const base = `https://graph.instagram.com/${GRAPH_VERSION}`;
  const h = { Authorization: `Bearer ${o.token}`, "Content-Type": "application/json" };
  const status = async (id: string) => {
    const r = await f(`${base}/${id}?fields=status_code`, { headers: h });
    if (r.status === 401 || r.status === 403) return "AUTH";
    return r.ok ? String((await r.json()).status_code) : "UNKNOWN";
  };
  let container = o.existingContainer ?? null;
  if (container) {
    const s = await status(container);
    if (s === "PUBLISHED") return { outcome: "published", containerId: container, externalId: container };
    if (s === "AUTH") return classifyCreate(401, "Instagram");
    if (s === "ERROR" || s === "EXPIRED") container = null;
  }
  if (!container) {
    const create = async (body: Record<string, unknown>) => {
      const r = await f(`${base}/${o.igUserId}/media`, { method: "POST", headers: h, body: JSON.stringify(body) });
      return r.ok ? { id: String((await r.json()).id) } : { fail: classifyCreate(r.status, "Instagram") };
    };
    let made: { id?: string; fail?: PublishOutcome };
    if (o.media.length === 1) {
      const m = o.media[0];
      made = await create(m.kind === "video" ? { media_type: "REELS", video_url: m.url, caption: o.caption } : { image_url: m.url, caption: o.caption });
    } else {
      const children: string[] = [];
      for (const m of o.media) {
        const c = await create(m.kind === "video" ? { media_type: "VIDEO", video_url: m.url, is_carousel_item: true } : { image_url: m.url, is_carousel_item: true });
        if (c.fail) return c.fail.outcome === "permanent_error" && c.fail.error === UNKNOWN ? { outcome: "retryable_error", error: "Instagram didn’t accept a carousel item; trying again." } : c.fail;
        children.push(c.id!);
      }
      made = await create({ media_type: "CAROUSEL", children: children.join(","), caption: o.caption });
    }
    // Creating a container publishes nothing, so a failed or unclear create is safe to retry.
    if (made.fail) return made.fail.error === UNKNOWN ? { outcome: "retryable_error", error: "Instagram didn’t accept the media yet; trying again." } : made.fail;
    container = made.id!;
  }
  for (let i = 0; i < 6; i++) {
    const s = await status(container);
    if (s === "FINISHED") break;
    if (s === "AUTH") return classifyCreate(401, "Instagram");
    if (s === "ERROR" || s === "EXPIRED") return { outcome: "permanent_error", containerId: container, error: "Instagram couldn’t process the media. Check the format and size." };
    if (i === 5) return { outcome: "retryable_error", containerId: container, error: "Instagram is still processing the media." };
    await sleep(5000);
  }
  let pub: Response;
  try {
    pub = await f(`${base}/${o.igUserId}/media_publish`, { method: "POST", headers: h, body: JSON.stringify({ creation_id: container }) });
  } catch {
    return { outcome: "permanent_error", containerId: container, error: UNKNOWN };
  }
  if (!pub.ok) return { ...classifyCreate(pub.status, "Instagram"), containerId: container };
  const id = String((await pub.json()).id);
  let url: string | undefined;
  try {
    const p = await f(`${base}/${id}?fields=permalink`, { headers: h });
    if (p.ok) url = (await p.json()).permalink;
  } catch {
    /* permalink is optional */
  }
  return { outcome: "published", externalId: id, externalUrl: url, containerId: container };
}
