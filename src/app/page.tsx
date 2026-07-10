import { TopBar } from "@/components/shared/TopBar";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ActivityGrid } from "@/components/dashboard/ActivityGrid";
import { PerformanceStats } from "@/components/dashboard/PerformanceStats";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { LastResultsWidget } from "@/components/dashboard/LastResultsWidget";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <DashboardLayout
        left={
          <>
            <ActivityGrid />
            <PerformanceStats />
          </>
        }
        middle={<ControlPanel />}
        right={<LastResultsWidget />}
      />
    </div>
  );
}
