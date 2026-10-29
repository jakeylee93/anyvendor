"use client";

import { useEffect } from "react";
import { useShortlist, type PlanEvent } from "./ShortlistProvider";

/** Remembers the event details from the plan page on this device. */
export default function SaveEvent({ event }: { event: PlanEvent }) {
  const { setEvent } = useShortlist();
  useEffect(() => {
    if (event.needs.length || event.ask || event.location || event.date) setEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(event)]);
  return null;
}
