import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, CloudUpload, History } from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import DailyReportCard from "../components/DailyReportCard";
import DataTable from "../components/DataTable";
import TaskBoard from "../components/TaskBoard";
import LoadingScreen from "../components/LoadingScreen";
import { dailyReportService } from "../services/dailyReportService";
import { taskService } from "../services/taskService";
import { formatDate } from "../utils/format";

const StudentDashboardPage = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("atlasia_token");
  
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: taskService.getTasks });
  const reportsQuery = useQuery({ 
    queryKey: ["student-daily-reports"], 
    queryFn: dailyReportService.getMyReports 
  });

  if (reportsQuery.isLoading || tasksQuery.isLoading) {
    return <LoadingScreen />;
  }

  const reports = reportsQuery.data?.reports || [];
  const tasks = tasksQuery.data?.tasks || [];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Task" value={tasks.length} hint="Assigned tasks visible on your board." icon={ClipboardList} />
        <StatCard label="Daily Report" value="FILE" hint="One submission per day (End-of-Day)." icon={CloudUpload} />
        <StatCard label="Total Reports" value={reports.length} hint="Historical daily report volume." icon={CheckCircle2} />
        <StatCard label="Recent Status" value={reports[0]?.status || "Pending"} hint="Latest daily report status." icon={History} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <DailyReportCard />
          <TaskBoard tasks={tasks} />
        </div>
        <div className="space-y-8">
          <div>
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.32em] text-brand-secondary">Report History</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Daily report history</h2>
            </div>
            <DataTable
              columns={[
                { key: "reportDate", label: "Date", render: (row) => formatDate(row.reportDate) },
                { key: "originalName", label: "Report Name", render: (row) => (
                    <span className="truncate max-w-[150px] inline-block">{row.originalFileName}</span>
                ) },
                { key: "status", label: "Status", render: (row) => (
                    <span className={cn(
                        "text-[10px] font-bold uppercase",
                        row.status === "SUBMITTED" ? "text-brand-secondary" : 
                        row.status === "REVIEWED" ? "text-emerald-400" : "text-amber-500"
                    )}>
                        {row.status}
                    </span>
                ) }
              ]}
              rows={reports}
              emptyText="No reports uploaded yet."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default StudentDashboardPage;
