import type { Metadata } from "next";
import SectionPage from "@/components/site/SectionPage";
import { SECTIONS } from "@/lib/sections";

export const dynamicParams = false;

export function generateStaticParams() {
  // how-it-works, plan-my-event (legacy) and list-my-business (pricing) have their own folders.
  return Object.keys(SECTIONS)
    .filter((s) => s !== "how-it-works" && s !== "plan-my-event" && s !== "list-my-business")
    .map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  return { title: `${SECTIONS[(await params).section]?.title ?? "Anyvendor"} — Anyvendor` };
}

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  return <SectionPage section={(await params).section} />;
}
