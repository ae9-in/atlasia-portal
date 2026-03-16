import { useQuery } from "@tanstack/react-query";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { atlasiaService } from "../services/atlasiaService";
import { formatDate } from "../utils/format";

const SubmissionsPage = () => {
  const reportsQuery = useQuery({
    queryKey: ["all-submissions"],
    queryFn: () => atlasiaService.getTaskReports()
  });

  if (reportsQuery.isLoading) {
    return <LoadingScreen />;
  }

  const reports = reportsQuery.data?.reports || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Management</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Task Submissions</h1>
        <p className="mt-2 text-sm text-slate-400">View and download reports submitted by students across all tasks.</p>
      </div>

      <DataTable
        columns={[
          {
            key: "student",
            label: "Student Info",
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-semibold text-white">{row.studentId?.name || "Unknown"}</span>
                <span className="text-xs text-slate-400">{row.studentId?.email}</span>
                {row.studentId?.college && (
                    <span className="mt-1 text-[10px] text-brand-secondary uppercase tracking-wider font-bold">
                        {row.studentId.college}
                    </span>
                )}
              </div>
            )
          },
          {
            key: "task",
            label: "Task",
            render: (row) => (
              <div>
                <p className="font-medium text-white">{row.taskId?.title || "Deleted Task"}</p>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                        {row.studentId?.businessId?.name || "No Business"}
                    </span>
                </div>
              </div>
            )
          },
          {
            key: "submittedAt",
            label: "Submitted On",
            render: (row) => (
              <div className="text-sm text-slate-300">
                {formatDate(row.submittedAt)}
                <p className="text-[10px] opacity-60">
                    {new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                row.status === "SUBMITTED" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
              }`}>
                {row.status}
              </span>
            )
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <a
                  href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${row._id}?view=true`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-brand-secondary transition hover:bg-white/10"
                >
                  View Report
                </a>
                <a
                  href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${row._id}`}
                  className="rounded-xl border border-rose-500/10 bg-rose-500/5 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
                >
                  Download
                </a>
              </div>
            )
          }
        ]}
        rows={reports}
        emptyText="No submissions found."
      />
    </div>
  );
};

export default SubmissionsPage;
