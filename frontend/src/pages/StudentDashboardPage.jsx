import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, CloudUpload, History } from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import UploadDropzone from "../components/UploadDropzone";
import DataTable from "../components/DataTable";
import TaskBoard from "../components/TaskBoard";
import LoadingScreen from "../components/LoadingScreen";
import { reportService } from "../services/reportService";
import { taskService } from "../services/taskService";
import { formatDate } from "../utils/format";

const StudentDashboardPage = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("atlasia_token");
  const lastSelectedRef = useRef(null);
  const reportsQuery = useQuery({ queryKey: ["student-reports"], queryFn: reportService.getMyReports });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: taskService.getTasks });
  const uploadMutation = useMutation({
    mutationFn: reportService.upload,
    onSuccess: () => {
      toast.success("Report submitted");
      queryClient.invalidateQueries({ queryKey: ["student-reports"] });
    }
  });

  if (reportsQuery.isLoading || tasksQuery.isLoading) {
    return <LoadingScreen />;
  }

  const reports = reportsQuery.data?.reports || [];
  const tasks = tasksQuery.data?.tasks || [];
  const submittedToday = reportsQuery.data?.submittedToday;

  const handleFileSelect = (file) => {
    if (!file) {
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be 20MB or smaller");
      return;
    }
    if (lastSelectedRef.current === file.name && uploadMutation.isPending) {
      return;
    }
    lastSelectedRef.current = file.name;
    uploadMutation.mutate(file);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Task" value={tasks.length} hint="Assigned tasks visible on your board." icon={ClipboardList} />
        <StatCard label="Upload Report" value="FILE" hint="Maximum 20MB, up to 3 uploads per task." icon={CloudUpload} />
        <StatCard label="Submissions" value={reports.length} hint="Total reports across all your tasks." icon={CheckCircle2} />
        <StatCard label="Previous Reports" value={reports.length} hint="Your recent submissions and history." icon={History} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <UploadDropzone onFileSelect={handleFileSelect} disabled={submittedToday || uploadMutation.isPending} />
          <TaskBoard tasks={tasks} />
        </div>
        <div className="space-y-8">
          <div className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-secondary">Submission Status</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
              <div>
                <p className="text-2xl font-bold text-white">{submittedToday ? "Submitted" : "Pending"}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {submittedToday ? "Your report for today has been recorded." : "Upload your report file before the day ends."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.32em] text-brand-secondary">Previous Reports</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Submission history</h2>
            </div>
            <DataTable
              columns={[
                { key: "date", label: "Date", render: (row) => formatDate(row.date) },
                { key: "originalName", label: "Report Name" },
                {
                  key: "download",
                  label: "Download",
                  render: (row) => (
                    <div className="flex gap-3">
                      <a href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${row._id}?view=true&token=${localStorage.getItem("atlasia_token")}`} target="_blank" rel="noreferrer" className="text-brand-secondary">
                        View
                      </a>
                      <a href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${row._id}?token=${localStorage.getItem("atlasia_token")}`} className="text-slate-400">
                        Download
                      </a>
                    </div>
                  )
                },
                { key: "status", label: "Status", render: (row) => row.status }
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

export default StudentDashboardPage;
