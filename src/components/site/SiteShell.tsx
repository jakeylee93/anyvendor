import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="be-site flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
