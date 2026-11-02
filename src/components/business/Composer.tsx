"use client";

import { useMemo, useState } from "react";
import { validateForProvider, type MediaItem, type SocialProvider } from "@/lib/social/providers";

interface Account { id: string; provider: SocialProvider; name: string; ok: boolean }

/** Text box with live per-account previews and the same checks the server runs. */
export default function Composer({ accounts, initialBody = "", initialMedia = [], initialWhen = "", initialAccounts = [], tz }: {
  accounts: Account[]; initialBody?: string; initialMedia?: MediaItem[]; initialWhen?: string; initialAccounts?: string[]; tz: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [chosen, setChosen] = useState<string[]>(initialAccounts.length ? initialAccounts : accounts.filter((a) => a.ok).map((a) => a.id));
  const [newFiles, setNewFiles] = useState<MediaItem[]>([]);
  const media = useMemo(() => [...initialMedia, ...newFiles], [initialMedia, newFiles]);
  const selected = accounts.filter((a) => chosen.includes(a.id));

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-be-navy">Post</span>
        <textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={3000} placeholder="What would you like to share?"
          className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-[15px] text-be-navy focus:border-be-cyan focus:outline-none focus:ring-2 focus:ring-be-cyan/30" />
        <span className="mt-1 block text-right text-xs text-be-grey">{body.length} characters</span>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-be-navy">Photos or video</span>
        <input name="media" type="file" multiple accept="image/jpeg,image/png,video/mp4,video/quicktime"
          onChange={(e) => setNewFiles(Array.from(e.target.files ?? []).map((f) => ({ path: f.name, mime: f.type, bytes: f.size, kind: f.type.startsWith("video") ? "video" : "image" })))}
          className="mt-1 block w-full text-sm text-be-grey file:mr-3 file:rounded-full file:border-0 file:bg-be-mist file:px-4 file:py-2 file:font-semibold file:text-be-navy" />
        {initialMedia.length > 0 && <span className="mt-1 block text-xs text-be-grey">{initialMedia.length} file{initialMedia.length === 1 ? "" : "s"} already attached.</span>}
      </label>
      <fieldset>
        <legend className="text-sm font-semibold text-be-navy">Post to</legend>
        {accounts.length === 0 ? (
          <p className="mt-1 text-sm text-be-grey">Connect an account above first.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {accounts.map((a) => (
              <label key={a.id} className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ${chosen.includes(a.id) ? "bg-be-navy text-white ring-be-navy" : "bg-white text-be-navy ring-gray-300"} ${a.ok ? "" : "opacity-60"}`}>
                <input type="checkbox" name="accounts" value={a.id} checked={chosen.includes(a.id)} disabled={!a.ok}
                  onChange={(e) => setChosen((c) => (e.target.checked ? [...c, a.id] : c.filter((x) => x !== a.id)))} className="sr-only" />
                {a.provider === "instagram" ? "Instagram" : "LinkedIn"} · {a.name}{a.ok ? "" : " (reconnect)"}
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <label className="block">
        <span className="text-sm font-semibold text-be-navy">When</span>
        <input name="when" type="datetime-local" defaultValue={initialWhen} className="mt-1 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-[15px] text-be-navy sm:w-auto" />
        <span className="mt-1 block text-xs text-be-grey">Times are in {tz.replace("_", " ")}.</span>
      </label>
      {selected.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {selected.map((a) => {
            const problems = validateForProvider(a.provider, body, media);
            return (
              <div key={a.id} className="rounded-2xl bg-be-mist p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-be-grey">{a.provider === "instagram" ? "Instagram" : "LinkedIn"} preview</p>
                <div className="mt-2 rounded-xl bg-white p-3 text-sm text-be-navy shadow-sm">
                  <p className="font-semibold">{a.name}</p>
                  {a.provider === "instagram" && <div className="mt-2 flex aspect-square items-center justify-center rounded-lg bg-be-mist text-xs text-be-grey">{media.length ? `${media.length} item${media.length === 1 ? "" : "s"}` : "No photo yet"}</div>}
                  <p className="mt-2 whitespace-pre-wrap break-words">{body || <span className="text-be-grey">Your text appears here.</span>}</p>
                  {a.provider === "linkedin" && media.length > 0 && <div className="mt-2 flex h-32 items-center justify-center rounded-lg bg-be-mist text-xs text-be-grey">Image</div>}
                </div>
                {problems.length > 0 && <ul className="mt-2 space-y-1 text-xs text-rose-700">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
