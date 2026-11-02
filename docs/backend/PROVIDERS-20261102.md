# Provider facts used by the scheduler and SEO card (official docs, fetched 2 Nov 2026)

## LinkedIn (member posting, first priority)
- Headers on every call: `Linkedin-Version: 202610`, `X-Restli-Protocol-Version: 2.0.0`. Versions are supported for at least a year; no default version.
- OAuth: authorize `https://www.linkedin.com/oauth/v2/authorization` with `openid profile w_member_social`; token `POST https://www.linkedin.com/oauth/v2/accessToken` (form). Access token 60 days. **No refresh token** unless LinkedIn-approved partner: we show a reconnect prompt before day 60.
- Author: `GET https://api.linkedin.com/v2/userinfo` → `sub` → `urn:li:person:{sub}`.
- Post: `POST https://api.linkedin.com/rest/posts` (201, id in `x-restli-id` header). Commentary uses "little" text: escape `| { } @ [ ] ( ) < > # \ * _ ~`.
- Image: `POST /rest/images?action=initializeUpload` → `PUT` bytes to `uploadUrl` with Bearer → post with `content.media.id`. JPG/GIF/PNG.
- Organisation pages need `w_organization_social` (Community Management API, vetted, separate app). Not in this preview.
- Sources: learn.microsoft.com linkedin posts-api, images-api, vector-asset-api, little-text-format, authorization-code-flow, programmatic-refresh-tokens, getting-access.

## Instagram (professional accounts, Instagram API with Instagram Login)
- OAuth: `https://www.instagram.com/oauth/authorize` scopes `instagram_business_basic,instagram_business_content_publish`; code → `POST https://api.instagram.com/oauth/access_token` (1 h token, `user_id`) → `GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token` (60 days) → refresh `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token` (token ≥24 h old, before expiry).
- Publish (v26.0): `POST https://graph.instagram.com/v26.0/{IG_ID}/media` (`image_url` public JPEG ≤8 MB, aspect 4:5–1.91:1; or `media_type=REELS` + `video_url`) → poll `GET /{container}?fields=status_code` until FINISHED (≤5 min) → `POST /{IG_ID}/media_publish {creation_id}`. Caption ≤2,200 chars, ≤30 hashtags. Limit read at runtime from `content_publishing_limit` (docs say 50 or 100 per 24 h).
- **Real customers need Advanced Access via Meta App Review + Business Verification.** Standard Access only works for accounts with a role on the app.

## Google Search Console
- OAuth `https://accounts.google.com/o/oauth2/v2/auth` with `https://www.googleapis.com/auth/webmasters.readonly`, `access_type=offline`, `prompt=consent`; token `https://oauth2.googleapis.com/token`.
- Sites: `GET https://www.googleapis.com/webmasters/v3/sites`. Query: `POST https://www.googleapis.com/webmasters/v3/sites/{encoded siteUrl}/searchAnalytics/query` with startDate/endDate/dimensions/rowLimit. Data lags 2–3 days.
- Unverified Google apps may show a warning and a 100-user cap; check the scope classification in Google Cloud Console.
