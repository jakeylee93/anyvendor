"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, RotateCcw } from "lucide-react";
import { DEFAULT_LAYOUT, WIDGETS, type LayoutItem, type WidgetId } from "@/lib/business/dashboard";

/** Home widgets with an edit pen: show or hide and reorder. Saved per person per business. */
export default function DashboardGrid({ initial, nodes, save, demo }: {
  initial: LayoutItem[];
  nodes: Partial<Record<WidgetId, React.ReactNode>>;
  save: (layout: string) => Promise<{ ok: boolean }>;
  demo: boolean;
}) {
  const [layout, setLayout] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const meta = Object.fromEntries(WIDGETS.map((w) => [w.id, w]));
  const move = (i: number, d: -1 | 1) =>
    setLayout((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const c = [...l];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const finish = () =>
    start(async () => {
      if (demo) {
        setNote("Demo: your arrangement isn’t saved.");
        setEditing(false);
        return;
      }
      const r = await save(JSON.stringify(layout));
      setNote(r.ok ? "Saved." : "Couldn’t save just now.");
      setEditing(false);
    });
  const visible = layout.filter((l) => nodes[l.id] !== undefined && (editing || !l.hidden));

  return (
    <section aria-label="Dashboard">
      <div className="mb-3 flex items-center justify-end gap-2">
        {note && !editing && <span className="text-xs text-be-grey">{note}</span>}
        {editing && (
          <button type="button" onClick={() => setLayout(DEFAULT_LAYOUT)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-be-navy ring-1 ring-gray-300">
            <RotateCcw size={15} aria-hidden /> Reset
          </button>
        )}
        <button
          type="button"
          onClick={() => (editing ? finish() : setEditing(true))}
          disabled={pending}
          aria-pressed={editing}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${editing ? "bg-be-navy text-white" : "bg-white text-be-navy ring-1 ring-gray-300"}`}
        >
          <Pencil size={15} aria-hidden /> {editing ? "Done" : "Edit"}
        </button>
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((item) => {
          const i = layout.findIndex((l) => l.id === item.id);
          return (
            <li key={item.id} className={`min-w-0 ${meta[item.id]?.wide ? "md:col-span-2" : ""} ${editing && item.hidden ? "opacity-50" : ""} relative`}>
              {editing && (
                <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-full bg-white/95 p-1 shadow ring-1 ring-gray-200">
                  <button type="button" onClick={() => move(i, -1)} aria-label={`Move ${meta[item.id]?.title} up`} className="rounded-full p-1.5 text-be-navy hover:bg-be-mist"><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => move(i, 1)} aria-label={`Move ${meta[item.id]?.title} down`} className="rounded-full p-1.5 text-be-navy hover:bg-be-mist"><ArrowDown size={16} /></button>
                  <button type="button" onClick={() => setLayout((l) => l.map((x) => (x.id === item.id ? { ...x, hidden: !x.hidden } : x)))} aria-label={`${item.hidden ? "Show" : "Hide"} ${meta[item.id]?.title}`} className="rounded-full p-1.5 text-be-navy hover:bg-be-mist">
                    {item.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              )}
              {nodes[item.id]}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
