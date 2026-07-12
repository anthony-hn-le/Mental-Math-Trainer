import { TopBar } from "@/components/shared/TopBar";
import { InstructionsBanner } from "@/components/shared/InstructionsBanner";
import { Footer } from "@/components/shared/Footer";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ActivityGrid } from "@/components/dashboard/ActivityGrid";
import { PerformanceStats } from "@/components/dashboard/PerformanceStats";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { LastResultsWidget } from "@/components/dashboard/LastResultsWidget";
import { ScoreTrend } from "@/components/dashboard/ScoreTrend";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <InstructionsBanner />
      <DashboardLayout
        left={
          <>
            <ActivityGrid />
            <PerformanceStats />
          </>
        }
        middle={<ControlPanel />}
        right={
          <>
            <LastResultsWidget />
            <ScoreTrend />
          </>
        }
      />
      <Footer />
    </div>
  );
}
