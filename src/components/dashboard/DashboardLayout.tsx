import type { ReactNode } from "react";

interface DashboardLayoutProps {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
}

/** 3-column grid; on mobile the Control Panel (primary CTA) comes first, then Last Results, then Activity/Stats. */
export function DashboardLayout({ left, middle, right }: DashboardLayoutProps) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr_300px] lg:py-10">
      <div className="order-3 flex flex-col gap-6 lg:order-1">{left}</div>
      <div className="order-1 flex flex-col gap-6 lg:order-2">{middle}</div>
      <div className="order-2 flex flex-col gap-6 lg:order-3">{right}</div>
    </div>
  );
}
