import { Cake, Camera, Car, ClipboardList, Mic, Music, Sparkles, Star, Tent, Utensils, Wine, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Wine,
  Utensils,
  Cake,
  Music,
  Camera,
  Tent,
  Sparkles,
  Car,
  Star,
  Mic,
  ClipboardList,
};

export function NeedIcon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? Star;
  return <C {...props} />;
}

/** Icon for a business's first category / industry (used on card pills). */
export function iconFor(industry: string | null, category: string | undefined) {
  if (category && /cake|candy|donut|dessert/i.test(category)) return "Cake";
  if (category && /magician|hypnotist|fireworks|performers|dancers/i.test(category)) return "Sparkles";
  if (category && /singer|tribute/i.test(category)) return "Mic";
  switch (industry) {
    case "drink-services":
      return "Wine";
    case "food-services":
      return "Utensils";
    case "entertainment":
      return "Music";
    case "photography-video":
      return "Camera";
    case "decor-ambiance":
      return "Tent";
    case "transport-logistics":
      return "Car";
    case "event-planning-management":
      return "ClipboardList";
    default:
      return "Star";
  }
}
