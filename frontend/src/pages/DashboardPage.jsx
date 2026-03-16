import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BriefcaseBusiness, ClipboardCheck, FileArchive, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import LoadingScreen from "../components/LoadingScreen";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";
import { formatDate } from "../utils/format";

const DashboardPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const tasksQuery = useQuery({ queryKey: ["dashboard-tasks", role], queryFn: role === "STUDENT" ? atlasiaService.getMyTasks : atlasiaService.getAllTasks });
  const businessesQuery = useQuery({ queryKey: ["businesses"], queryFn: atlasiaService.getBusinesses, enabled: role !== "STUDENT" });
  const reportsQuery = useQuery({ queryKey: ["student-reports"], queryFn: atlasiaService.getStudentReports, enabled: role === "STUDENT" });
  const adminOverview = useQuery({ queryKey: ["admin-overview"], queryFn: atlasiaService.getAdminOverview, enabled: role === "ADMIN" });
  const superOverview = useQuery({ queryKey: ["super-overview"], queryFn: atlasiaService.getSuperadminOverview, enabled: role === "SUPERADMIN" });

  if (tasksQuery.isLoading || adminOverview.isLoading || superOverview.isLoading || (role !== "STUDENT" && businessesQuery.isLoading)) {
    return <LoadingScreen />;
  }

  const myTasks = tasksQuery.data?.tasks || [];
  const businesses = businessesQuery.data?.businesses || [];

  const filteredTasks = role === "STUDENT" 
    ? myTasks 
    : myTasks.filter(task => !selectedBusinessId || task.businessId?._id === selectedBusinessId);

  const renderTasksTable = () => (
    <div className="mt-12 glass-panel p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Recent Tasks Overview</h2>
          <p className="mt-1 text-sm text-slate-400">View tasks and assigned students.</p>
        </div>
        {role !== "STUDENT" && (
          <select 
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white max-w-xs" 
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
          >
            <option value="">All Businesses</option>
            {businesses.map((business) => (
              <option key={business._id} value={business._id}>{business.name}</option>
            ))}
          </select>
        )}
      </div>
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          ...(role !== "STUDENT" ? [{ key: "student", label: "Assigned To", render: (row) => (
            <div className="flex flex-col">
              <span className="text-white font-medium">{row.assignedTo?.name || "-"}</span>
              {row.assignedTo?.college && <span className="text-[10px] text-brand-secondary">{row.assignedTo.college}</span>}
            </div>
          ) }] : []),
          { key: "business", label: "Business", render: (row) => {
            const name = row.businessId?.name;
            if (!name) return "-";
            const colors = ["bg-rose-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
              hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const colorClass = colors[Math.abs(hash) % colors.length];
            return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white/90 ${colorClass}`}>{name}</span>;
          } },
          { key: "sprint", label: "Sprint", render: (row) => row.sprintId?.name || "-" },
          { key: "deadline", label: "Deadline", render: (row) => formatDate(row.deadlineDate) },
          { key: "status", label: "Status", render: (row) => (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">{row.status}</span>
          ) },
        ]}
        rows={filteredTasks}
        emptyText="No tasks match the selected criteria."
      />
    </div>
  );

  if (role === "STUDENT") {
    const reports = reportsQuery.data?.reports || [];
    const pending = myTasks.filter((task) => task.status === "ASSIGNED" || task.status === "IN_PROGRESS").length;
    const completed = myTasks.filter((task) => ["SUBMITTED", "COMPLETED", "REVIEWED"].includes(task.status)).length;

    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Student Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-white">My assigned workbook tasks</h1>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Assigned Tasks" value={myTasks.length} hint="Tasks visible only to you." icon={ClipboardCheck} />
          <StatCard label="Pending Tasks" value={pending} hint="Still in progress or not submitted." icon={Activity} />
          <StatCard label="Completed Tasks" value={completed} hint="Submitted or reviewed work items." icon={FileArchive} />
          <StatCard label="Reports Uploaded" value={reports.length} hint="Reports successfully uploaded." icon={FileArchive} />
        </div>
      </div>
    );
  }

  if (role === "ADMIN") {
    const stats = adminOverview.data?.stats || {};
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Admin Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Manage student delivery across Atlasia</h1>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Students" value={stats.totalStudents || 0} hint="Students across your workbook view." icon={Users} />
          <StatCard label="Tasks Created" value={stats.tasksCreated || 0} hint="Tasks authored by admins." icon={ClipboardCheck} />
          <StatCard label="Reports Submitted" value={stats.reportsSubmitted || 0} hint="Reports visible to admins." icon={FileArchive} />
          <StatCard label="Pending Reports" value={stats.pendingReports || 0} hint="Assigned work still awaiting upload." icon={Activity} />
        </div>
        {renderTasksTable()}
      </div>
    );
  }

  const stats = superOverview.data?.stats || {};
  const weeklySubmissions = superOverview.data?.weeklySubmissions || [];
  const completionRate = superOverview.data?.completionRate || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Superadmin Dashboard</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Platform-wide analytics for Atlasia Workbook</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents || 0} hint="Student accounts on the platform." icon={Users} />
        <StatCard label="Total Admins" value={stats.totalAdmins || 0} hint="Admin accounts managed centrally." icon={Users} />
        <StatCard label="Total Businesses" value={stats.totalBusinesses || 0} hint="Atlasia business workstreams." icon={BriefcaseBusiness} />
        <StatCard label="Total Tasks" value={stats.totalTasks || 0} hint="Workbook tasks across all sprints." icon={ClipboardCheck} />
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <div className="glass-panel h-80 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Weekly Submissions</p>
          <div className="mt-6 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySubmissions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip cursor={false} />
                <Bar dataKey="count" fill="#6C63FF" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel h-80 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Task Completion Rate</p>
          <div className="mt-6 h-60 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Area type="monotone" dataKey="rate" stroke="#00C2FF" fill="rgba(0,194,255,0.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {renderTasksTable()}
    </div>
  );
};

export default DashboardPage;
