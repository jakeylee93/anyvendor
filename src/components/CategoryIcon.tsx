import {
  Wine,
  UtensilsCrossed,
  Music,
  Camera,
  Building2,
  Theater,
  Flower2,
  Car,
  Cake,
  Package,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, { icon: LucideIcon; label: string; href: string }> = {
  bars: { icon: Wine, label: "Bars & Drinks", href: "/directory?category=bars" },
  catering: { icon: UtensilsCrossed, label: "Catering", href: "/directory?category=catering" },
  music: { icon: Music, label: "Music & DJs", href: "/directory?category=music" },
  photography: { icon: Camera, label: "Photography", href: "/directory?category=photography" },
  venues: { icon: Building2, label: "Venues", href: "/directory?category=venues" },
  entertainment: { icon: Theater, label: "Entertainment", href: "/directory?category=entertainment" },
  decor: { icon: Flower2, label: "Decor & Flowers", href: "/directory?category=decor" },
  transport: { icon: Car, label: "Transport", href: "/directory?category=transport" },
  cakes: { icon: Cake, label: "Cakes & Treats", href: "/directory?category=cakes" },
  hire: { icon: Package, label: "Equipment Hire", href: "/directory?category=hire" },
};

export const categoryList = Object.entries(categoryIcons).map(([key, val]) => ({
  key,
  ...val,
}));
