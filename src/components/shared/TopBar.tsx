import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-sm font-semibold tracking-tight">Mental Math Trainer</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
