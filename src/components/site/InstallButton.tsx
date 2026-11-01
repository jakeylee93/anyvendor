"use client";

import { useEffect, useState } from "react";
import { Share, Smartphone, X } from "lucide-react";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** "Add to home screen": native prompt where the browser offers one, a short
 *  how-to on iPhone, hidden once the site is running as an installed app. */
export default function InstallButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    queueMicrotask(() => {
      setStandalone(isStandalone);
      setIos(isIos);
    });
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIP);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || (!deferred && !ios)) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      setHelp(true);
    }
  };

  return (
    <>
      <button type="button" onClick={install} className={`inline-flex items-center justify-center gap-2 rounded-full border border-be-navy/20 bg-white px-4 py-2.5 text-sm font-semibold text-be-navy hover:bg-be-mist ${className}`}>
        <Smartphone size={16} aria-hidden /> Add to home screen
      </button>
      {help && (
        <div role="dialog" aria-label="Add Anyvendor to your home screen" className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-black/10">
          <div className="mx-auto max-w-md">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-be-navy">Add Anyvendor to your home screen</h2>
              <button type="button" onClick={() => setHelp(false)} aria-label="Close" className="rounded-full p-1.5 text-be-grey hover:bg-be-mist">
                <X size={18} />
              </button>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                1. Tap the Share button <Share size={16} className="text-be-navy" aria-hidden /> at the bottom of Safari.
              </li>
              <li>2. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>3. Tap <strong>Add</strong>. Anyvendor opens like an app from now on.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
