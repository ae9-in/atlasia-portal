import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Calendar, FileText, CheckCircle, AlertCircle, Eye, Download } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { dailyReportService } from "../services/dailyReportService";
import { formatDate } from "../utils/format";

const DailyReportsPage = () => {
  const queryClient = useQueryClient();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-daily-reports", filterDate, searchTerm, currentPage],
    queryFn: () => dailyReportService.getAllReports({ 
      date: filterDate, 
      studentName: searchTerm, // Note: Backend search logic might need adjustment for regex
      page: currentPage 
    }),
    keepPreviousData: true
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNote }) => dailyReportService.updateStatus(id, { status, adminNote }),
    onSuccess: () => {
      toast.success("Report status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-daily-reports"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  if (isLoading && !data) return <LoadingScreen />;

  const reports = data?.reports || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary text-primary">Administration</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Daily Reports</h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="rounded-full bg-brand-primary/20 p-3 text-brand-secondary">
            <Calendar size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase font-bold">Filter By Date</p>
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-transparent text-white outline-none mt-1"
            />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-4 md:col-span-2">
          <div className="rounded-full bg-brand-primary/20 p-3 text-brand-secondary">
            <Search size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 uppercase font-bold">Search Student</p>
            <input 
              type="text" 
              placeholder="Enter student name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white outline-none mt-1"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <DataTable
          columns={[
            { 
                key: "student", 
                label: "Student", 
                render: (row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-white">{row.studentId?.name}</span>
                        <span className="text-[10px] text-slate-400">{row.studentId?.college || 'No College'}</span>
                    </div>
                ) 
            },
            { 
                key: "reportDate", 
                label: "Date", 
                render: (row) => formatDate(row.reportDate) 
            },
            { 
                key: "file", 
                label: "File", 
                render: (row) => (
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-xs text-slate-300 truncate max-w-[120px]">{row.originalFileName}</span>
                    </div>
                ) 
            },
            { 
                key: "status", 
                label: "Status", 
                render: (row) => (
                    <span className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                        row.status === "REVIEWED" ? "bg-emerald-500/20 text-emerald-400" :
                        row.status === "RESUBMIT_REQUESTED" ? "bg-amber-500/20 text-amber-400" :
                        "bg-brand-primary/20 text-brand-secondary"
                    )}>
                        {row.status}
                    </span>
                ) 
            },
            { 
                key: "submittedAt", 
                label: "Submitted", 
                render: (row) => new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
            {
                key: "actions",
                label: "Actions",
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <a 
                           href={`${import.meta.env.VITE_API_URL || ""}/api/daily-reports/${row._id}/download?view=true&token=${localStorage.getItem("atlasia_token")}&t=${Date.now()}`}
                           target="_blank"
                           rel="noreferrer"
                           className="flex items-center gap-1 rounded-xl bg-brand-secondary/10 px-4 py-2 text-xs font-bold text-brand-secondary transition hover:bg-brand-secondary/20"
                           title="View Inline"
                        >
                            View
                        </a>
                        <select 
                            className="bg-slate-900 border border-white/10 text-xs rounded-lg px-2 py-1 text-white outline-none"
                            value={row.status}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus !== row.status) {
                                    const adminNote = window.prompt("Enter admin note (optional):", row.adminNote || "");
                                    updateStatusMutation.mutate({ id: row._id, status: newStatus, adminNote: adminNote || "" });
                                }
                            }}
                        >
                            <option value="SUBMITTED">Submitted</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="RESUBMIT_REQUESTED">Resubmit</option>
                        </select>
                    </div>
                )
            }
          ]}
          rows={reports}
          emptyText="No daily reports found for this selection."
        />
        
        {data?.pages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-slate-400">Page {data.page} of {data.pages}</p>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 bg-white/5 rounded text-xs text-white disabled:opacity-30"
                    >
                        Prev
                    </button>
                    <button 
                         disabled={currentPage === data.pages}
                         onClick={() => setCurrentPage(p => p + 1)}
                         className="px-3 py-1 bg-white/5 rounded text-xs text-white disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default DailyReportsPage;
