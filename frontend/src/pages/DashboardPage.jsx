import { useQuery } from "@tanstack/react-query";
import { Activity, BriefcaseBusiness, ClipboardCheck, FileArchive, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import LoadingScreen from "../components/LoadingScreen";
import StatCard from "../components/StatCard";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";

const DashboardPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  const tasksQuery = useQuery({ queryKey: ["dashboard-tasks"], queryFn: atlasiaService.getMyTasks });
  const reportsQuery = useQuery({ queryKey: ["student-reports"], queryFn: atlasiaService.getStudentReports, enabled: role === "STUDENT" });
  const coordinatorOverview = useQuery({ queryKey: ["coord-overview"], queryFn: atlasiaService.getCoordinatorOverview, enabled: role === "COORDINATOR" });
  const superOverview = useQuery({ queryKey: ["super-overview"], queryFn: atlasiaService.getSuperOverview, enabled: role === "SUPER_ADMIN" });

  if (tasksQuery.isLoading || coordinatorOverview.isLoading || superOverview.isLoading) {
    return <LoadingScreen />;
  }

  const myTasks = tasksQuery.data?.tasks || [];

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
          <StatCard label="Reports Uploaded" value={reports.length} hint="ZIP reports successfully uploaded." icon={FileArchive} />
        </div>
      </div>
    );
  }

  if (role === "COORDINATOR") {
    const stats = coordinatorOverview.data?.stats || {};
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Coordinator Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Manage student delivery across Atlasia</h1>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Students" value={stats.totalStudents || 0} hint="Students across your workbook view." icon={Users} />
          <StatCard label="Tasks Created" value={stats.tasksCreated || 0} hint="Tasks authored by coordinators." icon={ClipboardCheck} />
          <StatCard label="Reports Submitted" value={stats.reportsSubmitted || 0} hint="Reports visible to coordinators." icon={FileArchive} />
          <StatCard label="Pending Reports" value={stats.pendingReports || 0} hint="Assigned work still awaiting upload." icon={Activity} />
        </div>
      </div>
    );
  }

  const stats = superOverview.data?.stats || {};
  const weeklySubmissions = superOverview.data?.weeklySubmissions || [];
  const completionRate = superOverview.data?.completionRate || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Super Admin Dashboard</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Platform-wide analytics for Atlasia Workbook</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents || 0} hint="Student accounts on the platform." icon={Users} />
        <StatCard label="Total Coordinators" value={stats.totalCoordinators || 0} hint="Coordinator accounts managed centrally." icon={Users} />
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
    </div>
  );
};

export default DashboardPage;
