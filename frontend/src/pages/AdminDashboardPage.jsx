import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Clock3, FileText, Search, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { reportService } from "../services/reportService";
import { taskService } from "../services/taskService";
import { adminService } from "../services/adminService";
import { formatDate, formatTime } from "../utils/format";

const AdminDashboardPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm();

  const statusQuery = useQuery({ queryKey: ["report-status"], queryFn: reportService.getStatus });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: taskService.getTasks });
  const studentsQuery = useQuery({ queryKey: ["students", search], queryFn: () => adminService.getStudents(search) });

  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      reset();
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });

  const toggleStudentMutation = useMutation({
    mutationFn: adminService.toggleStudentStatus,
    onSuccess: () => {
      toast.success("Student status updated");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["report-status"] });
    }
  });

  const filteredTracker = useMemo(() => {
    const tracker = statusQuery.data?.tracker || [];
    if (!search.trim()) {
      return tracker;
    }
    return tracker.filter(
      (student) =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, statusQuery.data]);

  if (statusQuery.isLoading || tasksQuery.isLoading || studentsQuery.isLoading) {
    return <LoadingScreen />;
  }

  const stats = statusQuery.data?.stats || {};
  const weeklyTrend = statusQuery.data?.weeklyTrend || [];
  const tasks = tasksQuery.data?.tasks || [];
  const students = studentsQuery.data?.students || [];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents || 0} hint="Registered student accounts." icon={Users} />
        <StatCard label="Submitted Today" value={stats.reportsSubmittedToday || 0} hint="ZIP reports received today." icon={Clock3} />
        <StatCard label="Reports Pending" value={stats.reportsPending || 0} hint="Students still missing today's upload." icon={BarChart3} />
        <StatCard label="Total Reports" value={stats.totalReports || 0} hint="Historical report volume." icon={FileText} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Daily Tracker</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Submission analytics</h2>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-4 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Bar dataKey="count" fill="#6C63FF" radius={[10, 10, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-4 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#00C2FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Area type="monotone" dataKey="count" stroke="#00C2FF" fill="url(#trendFill)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Task Management</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Create daily tasks</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => createTaskMutation.mutate(values))}>
            <input placeholder="Task title" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("title", { required: true })} />
            <textarea placeholder="Task description" rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("description", { required: true })} />
            <input type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("deadline", { required: true })} />
            <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Student Management</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Students and submission status</h2>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" className="w-full bg-transparent outline-none" />
          </label>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Student" },
            { key: "submittedToday", label: "Submitted", render: (row) => (row.submittedToday ? "Submitted" : "Pending") },
            { key: "submissionTime", label: "Time", render: (row) => formatTime(row.submissionTime) },
            {
              key: "reportFile",
              label: "Report",
              render: (row) => row.reportFile ? <a href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${row.reportFile}`} className="text-brand-secondary">Download</a> : "Pending"
            }
          ]}
          rows={filteredTracker}
          emptyText="No students found."
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">All Students</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Activate or deactivate accounts</h2>
          <div className="mt-6 space-y-3">
            {students.map((student) => (
              <div key={student._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div>
                  <p className="font-semibold text-white">{student.name}</p>
                  <p className="text-sm text-slate-400">{student.email}</p>
                </div>
                <button type="button" onClick={() => toggleStudentMutation.mutate(student._id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${student.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {student.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Assigned Tasks</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Manage current board</h2>
          <div className="mt-6 space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{task.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">Due {formatDate(task.deadline)}</p>
                  </div>
                  <button type="button" onClick={() => deleteTaskMutation.mutate(task._id)} className="rounded-full bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
