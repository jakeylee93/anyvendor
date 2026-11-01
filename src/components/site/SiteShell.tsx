import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { ShortlistProvider } from "./ShortlistProvider";
import PlanBar from "./PlanBar";
import BottomNav from "./BottomNav";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ShortlistProvider>
      <div className="be-site flex min-h-screen flex-col pb-16 lg:pb-0 print:pb-0">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <PlanBar />
        <BottomNav />
      </div>
    </ShortlistProvider>
  );
}
