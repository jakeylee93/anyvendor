// Runs one claimed target to an explicit outcome. Used only by the scheduler cron with
// the service role. Never called from a page.
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken, encryptToken } from "@/lib/security/tokens";
import { publishInstagram, publishLinkedIn, refreshInstagram, type MediaItem, type PublishOutcome } from "./providers";

interface Target { id: string; post_id: string; connection_id: string; provider: string; provider_container_id: string | null }

export async function runTarget(db: SupabaseClient, t: Target, key: string): Promise<PublishOutcome> {
  const [{ data: post }, { data: conn }, { data: tok }] = await Promise.all([
    db.from("social_posts").select("body, media").eq("id", t.post_id).single(),
    db.from("provider_connections").select("external_account_id, token_expires_at, settings").eq("id", t.connection_id).single(),
    db.from("provider_tokens").select("access_ciphertext").eq("connection_id", t.connection_id).maybeSingle(),
  ]);
  if (!post || !conn) return { outcome: "permanent_error", error: "The post or account no longer exists." };
  if (!tok) return { outcome: "auth_error", error: "The account needs reconnecting." };
  if (conn.token_expires_at && new Date(conn.token_expires_at).getTime() < Date.now()) return { outcome: "auth_error", error: "The account’s access expired. Reconnect it." };
  let token = decryptToken(tok.access_ciphertext, key);
  const media = (post.media ?? []) as MediaItem[];

  if (t.provider === "instagram") {
    const issued = Date.parse(String((conn.settings as Record<string, unknown>)?.tokenIssuedAt ?? 0));
    const expires = conn.token_expires_at ? Date.parse(conn.token_expires_at) : 0;
    if (expires && expires - Date.now() < 7 * 86400_000 && Date.now() - issued > 86400_000) {
      try {
        const r = await refreshInstagram(token);
        token = r.accessToken;
        await db.from("provider_tokens").update({ access_ciphertext: encryptToken(token, key), access_expires_at: r.expiresAt, updated_at: new Date().toISOString() }).eq("connection_id", t.connection_id);
        await db.from("provider_connections").update({ token_expires_at: r.expiresAt, settings: { ...(conn.settings as object), tokenIssuedAt: new Date().toISOString() } }).eq("id", t.connection_id);
      } catch {
        /* keep the current token; it is still valid */
      }
    }
    const urls = await Promise.all(media.map(async (m) => ({ url: (await db.storage.from("social-media").createSignedUrl(m.path, 3600)).data?.signedUrl ?? "", kind: m.kind })));
    if (urls.some((u) => !u.url)) return { outcome: "permanent_error", error: "A media file is missing." };
    return publishInstagram({ token, igUserId: conn.external_account_id, caption: post.body, media: urls, existingContainer: t.provider_container_id });
  }

  if (t.provider === "linkedin") {
    let image: { data: Blob; mime: string } | undefined;
    if (media[0]) {
      const dl = await db.storage.from("social-media").download(media[0].path);
      if (!dl.data) return { outcome: "permanent_error", error: "A media file is missing." };
      image = { data: dl.data, mime: media[0].mime };
    }
    return publishLinkedIn({ token, author: conn.external_account_id, text: post.body, image });
  }
  return { outcome: "permanent_error", error: "Unsupported provider." };
}
