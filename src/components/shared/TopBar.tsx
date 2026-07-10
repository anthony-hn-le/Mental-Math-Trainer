import { ThemeToggle } from "./ThemeToggle";

const PERSONAL_SITE_URL = "https://anthony-le.vercel.app/";

export function TopBar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-3 sm:px-6">
        <div className="flex justify-start">
          <a
            href={PERSONAL_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Anthony Le's personal website"
            className="font-mono text-lg font-bold tracking-tight"
          >
            <span className="text-cyan-500 dark:text-cyan-400">AL</span>
            <span className="text-foreground">_</span>
          </a>
        </div>
        <span className="text-center text-sm font-semibold tracking-tight">Mental Math Trainer</span>
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
