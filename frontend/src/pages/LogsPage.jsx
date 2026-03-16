import { useQuery } from "@tanstack/react-query";
import { History, Search } from "lucide-react";
import { useState } from "react";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { atlasiaService } from "../services/atlasiaService";
import { formatDate } from "../utils/format";

const LogsPage = () => {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: atlasiaService.getActivityLogs
  });

  if (isLoading) return <LoadingScreen />;

  const logs = data?.logs || [];
  const filteredLogs = logs.filter(log => 
    log.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Security & Audit</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Activity Logs</h1>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
          <Search size={16} />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Filter logs..." 
            className="w-full bg-transparent outline-none" 
          />
        </label>
      </div>

      <div className="glass-panel p-6">
        <DataTable
          columns={[
            { 
              key: "user", 
              label: "Admin", 
              render: (row) => (
                <div>
                  <p className="font-semibold text-white">{row.userId?.name || "System"}</p>
                  <p className="text-xs text-slate-400">{row.userId?.email}</p>
                </div>
              )
            },
            { 
              key: "action", 
              label: "Action", 
              render: (row) => (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-secondary">
                  {row.action}
                </span>
              )
            },
            { key: "details", label: "Details", render: (row) => <p className="text-sm text-slate-200">{row.details}</p> },
            { 
              key: "timestamp", 
              label: "Date & Time", 
              render: (row) => (
                <div className="text-xs text-slate-400">
                  <p>{formatDate(row.createdAt)}</p>
                  <p>{new Date(row.createdAt).toLocaleTimeString()}</p>
                </div>
              )
            },
            { key: "ip", label: "IP Address", render: (row) => <span className="text-xs text-slate-500 font-mono">{row.ip || "N/A"}</span> }
          ]}
          rows={filteredLogs}
          emptyText="No activity logs found."
        />
      </div>
    </div>
  );
};

export default LogsPage;
