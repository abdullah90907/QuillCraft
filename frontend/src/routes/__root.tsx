import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenText, GraduationCap, Moon, PenLine, Sun } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuillCraftProvider } from "@/lib/quillcraft-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "QuillCraft | Build Better Learning Bots" },
      {
        name: "description",
        content:
          "Design tutoring bots, tune teaching style, and test educational responses in a polished workflow with QuillCraft.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "QuillCraft | Build Better Learning Bots" },
      {
        property: "og:description",
        content:
          "Create and test educational AI bot personas with a modern, animated workspace designed for teachers and course builders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <QuillCraftProvider>
        <AppShell>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </AppShell>
      </QuillCraftProvider>
    </QueryClientProvider>
  );
}

const navLinkClass =
  "rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

function AppShell({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useThemeMode();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2" aria-label="Go to QuillCraft home">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <PenLine className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-[1.25rem] leading-none">QuillCraft</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Educational AI Studio</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-card/80 p-1.5 shadow-sm">
            <Link
              to="/"
              className={navLinkClass}
              activeProps={{ className: cn(navLinkClass, "bg-muted text-foreground shadow-sm") }}
              inactiveProps={{ className: cn(navLinkClass, "text-muted-foreground hover:text-foreground") }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <Link
              to="/build"
              className={navLinkClass}
              activeProps={{ className: cn(navLinkClass, "bg-muted text-foreground shadow-sm") }}
              inactiveProps={{ className: cn(navLinkClass, "text-muted-foreground hover:text-foreground") }}
            >
              Build
            </Link>
            <Link
              to="/test"
              className={navLinkClass}
              activeProps={{ className: cn(navLinkClass, "bg-muted text-foreground shadow-sm") }}
              inactiveProps={{ className: cn(navLinkClass, "text-muted-foreground hover:text-foreground") }}
            >
              Test
            </Link>
          </nav>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={pageTransition}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <footer className="border-t border-border/80 bg-muted/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} QuillCraft</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpenText className="h-4 w-4" /> Learning-first
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-4 w-4" /> Thoughtful AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

type ThemeMode = "light" | "dark";

function useThemeMode(): [ThemeMode, (next: ThemeMode) => void] {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? (window.localStorage.getItem("quillcraft-theme") as ThemeMode | null) : null;
    const preferred: ThemeMode =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setTheme(saved ?? preferred);
  }, [setTheme]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("quillcraft-theme", theme);
    }
  }, [theme]);

  return [theme, setTheme];
}
