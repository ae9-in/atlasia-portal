import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DailyReportCard from "../components/DailyReportCard";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import TaskBoard from "../components/TaskBoard";
import UploadDropzone from "../components/UploadDropzone";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";
import { formatDate } from "../utils/format";

const TasksPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("atlasia_token");
  const role = normalizeRole(user?.role);
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");

  const tasksQuery = useQuery({
    queryKey: ["tasks-page", role],
    queryFn: role === "STUDENT" ? atlasiaService.getMyTasks : atlasiaService.getAllTasks
  });
  const sprintsQuery = useQuery({
    queryKey: ["sprints"],
    queryFn: atlasiaService.getSprints,
    enabled: role !== "STUDENT"
  });
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => atlasiaService.getUsers("STUDENT"),
    enabled: role !== "STUDENT"
  });
  const reportsQuery = useQuery({
    queryKey: ["task-reports", selectedTaskId],
    queryFn: () => atlasiaService.getTaskReports(selectedTaskId),
    enabled: !!selectedTaskId && role !== "STUDENT"
  });
  const businessesQuery = useQuery({
    queryKey: ["businesses"],
    queryFn: atlasiaService.getBusinesses,
    enabled: role !== "STUDENT"
  });

  const createMutation = useMutation({
    mutationFn: atlasiaService.createTask,
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks-page"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to create task");
    }
  });
  const commentMutation = useMutation({
    mutationFn: atlasiaService.addComment,
    onSuccess: () => {
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: ["tasks-page"] });
    }
  });
  const reportMutation = useMutation({
    mutationFn: ({ taskId, file }) => atlasiaService.uploadReport(taskId, file),
    onSuccess: () => {
      toast.success("Report uploaded");
      queryClient.invalidateQueries({ queryKey: ["tasks-page"] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: atlasiaService.deleteTask,
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks-page"] });
    }
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { assignedTo: [] }
  });
  const commentForm = useForm();
  if (tasksQuery.isLoading || sprintsQuery.isLoading || studentsQuery.isLoading || (role !== "STUDENT" && businessesQuery.isLoading)) {
    return <LoadingScreen />;
  }

  const students = studentsQuery.data?.users || [];
  const businesses = businessesQuery.data?.businesses || [];
  
  const selectedStudentIds = watch("assignedTo") || [];
  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s._id));
  const currentStudentBusinesses = [...new Set(selectedStudents.map((s) => s.businessId?.name).filter(Boolean))];
  const selectedBusinessDisplay = currentStudentBusinesses.length > 0 
    ? currentStudentBusinesses.join(", ") 
    : "No business assigned yet";

  const tasks = tasksQuery.data?.tasks || [];
  const selectedCommentTaskId = commentForm.watch("taskId");
  const selectedCommentTask = tasks.find((t) => t._id === selectedCommentTaskId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Tasks</p>
        <h1 className="mt-2 text-4xl font-bold text-white">{role === "STUDENT" ? "My Tasks" : "Task Management"}</h1>
      </div>

      {role !== "STUDENT" ? (
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-bold text-white">Create task</h2>
          <form
            className="mt-6 grid gap-4 lg:grid-cols-2"
            onSubmit={handleSubmit(async (values) => {
              console.log("Create Task Values:", values);
              await createMutation.mutateAsync({ ...values, attachments: [] });
              reset();
            })}
          >
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Title" {...register("title", { required: true })} />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Expected Outcome" {...register("expectedOutcome", { required: true })} />
            <textarea className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white lg:col-span-2" placeholder="Description" {...register("description", { required: true })} />
            <input type="number" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Days Required" {...register("daysRequired", { required: true })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 px-1">Start Date</label>
              <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("startDate", { required: true })} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 px-1">End Date</label>
              <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("deadlineDate", { required: true })} />
            </div>
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 px-1">Assign to Students</label>
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {students.filter(s => 
                    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                    s.email.toLowerCase().includes(studentSearch.toLowerCase())
                  ).map((item) => (
                    <label key={item._id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-white/20 bg-slate-800 text-brand-primary focus:ring-brand-primary"
                        checked={selectedStudentIds.includes(item._id)}
                        onChange={(e) => {
                          const current = [...selectedStudentIds];
                          if (e.target.checked) {
                            setValue("assignedTo", [...current, item._id]);
                          } else {
                            setValue("assignedTo", current.filter(id => id !== item._id));
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name} {item.college ? `(${item.college})` : ''}</p>
                        <p className="text-xs text-slate-400 truncate">{item.businessId?.name || "No Business"} • {item.email}</p>
                      </div>
                    </label>
                  ))}
                  {students.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No students found.</p>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <p className="text-xs text-slate-400">{selectedStudentIds.length} students selected</p>
                  <button 
                    type="button" 
                    className="text-xs text-brand-secondary hover:underline"
                    onClick={() => setValue("assignedTo", selectedStudentIds.length === students.length ? [] : students.map(s => s._id))}
                  >
                    {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-400 px-1">Assign Business (Will update selected students)</label>
              <select className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...register("businessId", { required: true })}>
                <option value="">Select business</option>
                {businesses.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
              <p className="px-2 text-[10px] text-slate-500 italic">Current student businesses: {selectedBusinessDisplay}</p>
            </div>
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white lg:col-span-2" {...register("sprintId", { required: true })}>
              <option value="">Select sprint</option>
              {(sprintsQuery.data?.sprints || []).map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white lg:col-span-2" disabled={createMutation.isPending || selectedStudentIds.length === 0}>
              {createMutation.isPending ? "Creating Tasks..." : `Create Tasks for ${selectedStudentIds.length || 0} Students`}
            </button>
          </form>
        </div>
      ) : null}


      <div className="grid gap-8 xl:grid-cols-2">
        <form
          className="glass-panel p-6 flex flex-col h-full"
          onSubmit={commentForm.handleSubmit(async (values) => {
            console.log("Submitting comment values:", values);
            await commentMutation.mutateAsync(values);
            commentForm.setValue("message", "");
          })}
        >
          <h2 className="text-2xl font-bold text-white">Task comments</h2>
          
          <div className="mt-6 flex-1">
            <select className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...commentForm.register("taskId", { required: true })}>
              <option value="">Select task</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title} {role !== "STUDENT" ? `(${task.assignedTo?.name || 'Unknown'} - ${task.assignedTo?.college || 'No College'})` : ''}
                </option>
              ))}
            </select>

            {selectedCommentTask ? (
              <div className="mb-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Task Details</p>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedCommentTask.description}</p>
                  {selectedCommentTask.expectedOutcome && (
                    <div className="mt-3 border-t border-white/5 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">Expected Outcome</p>
                      <p className="mt-1 text-xs text-slate-400 whitespace-pre-wrap">{selectedCommentTask.expectedOutcome}</p>
                    </div>
                  )}
                </div>

                <div className="max-h-[300px] space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
                  {selectedCommentTask.comments?.length > 0 ? (
                    selectedCommentTask.comments.map((comment, idx) => (
                      <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-brand-secondary">{comment.userId?.name || "Unknown"}</span>
                          <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-sm text-white/90">{comment.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-slate-400">No comments yet</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-auto space-y-4">
            <textarea className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" rows={3} placeholder="Write a comment" {...commentForm.register("message", { required: true })} />
            <button type="submit" className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:opacity-50" disabled={!selectedCommentTaskId || commentMutation.isPending}>
              {commentMutation.isPending ? "Adding..." : "Add Comment"}
            </button>
          </div>
        </form>

        {role !== "STUDENT" ? (
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">Task reports</h2>
            <div className="mt-6 space-y-3">
              {(reportsQuery.data?.reports || []).map((report) => (
                <div key={report._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{report.studentId?.name}</p>
                  <p className="mt-2 text-sm text-slate-300">{report.taskId?.title}</p>
                  <div className="mt-4 flex gap-2">
                    <a 
                      className="rounded-lg bg-brand-secondary/10 px-3 py-1.5 text-[10px] font-bold text-brand-secondary transition hover:bg-brand-secondary/20 uppercase" 
                      target="_blank" 
                      rel="noreferrer" 
                      href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${report._id}?view=true&token=${localStorage.getItem("atlasia_token")}&t=${Date.now()}`}
                    >
                      View
                    </a>
                    <a 
                      className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300 transition hover:bg-white/10 uppercase" 
                      href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${report._id}?token=${localStorage.getItem("atlasia_token")}&t=${Date.now()}`}
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
              {!reportsQuery.data?.reports?.length ? <p className="text-slate-400">Select a task to inspect reports.</p> : null}
            </div>
          </div>
        ) : (
          <DailyReportCard />
        )}
      </div>

      <div className="mt-12">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary mb-4">Task Management</p>
        <h2 className="text-2xl font-bold text-white mb-6">Tasks Created</h2>
        <DataTable
          columns={[
            { key: "title", label: "Task Info", render: (row) => (
              <div className="max-w-[20rem] lg:max-w-md py-1">
                <p className="font-semibold text-white text-base">{row.title}</p>
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {row.description}
                  </p>
                  {row.expectedOutcome && (
                    <div className="rounded-lg bg-white/5 p-2 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-brand-secondary font-bold mb-1">Expected Outcome</p>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {row.expectedOutcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) },
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
            { key: "deadline", label: "Dates", render: (row) => (
              <div className="text-xs space-y-1">
                <div><span className="text-slate-400">Start: </span><span className="text-white">{formatDate(row.startDate)}</span></div>
                <div><span className="text-slate-400">End: </span><span className="text-white">{formatDate(row.deadlineDate)}</span></div>
              </div>
            ) },
            { key: "status", label: "Status", render: (row) => (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">{row.status}</span>
            ) },
            role === "STUDENT"
              ? {
                  key: "report",
                  label: "Upload Report",
                  render: (row) => {
                    const count = row.submissionCount || 0;
                    const isLimitReached = count >= 3;
                    return (
                      <div className="flex flex-col gap-1">
                        <label className={`${isLimitReached ? 'opacity-30 cursor-not-allowed text-white/50' : 'cursor-pointer text-brand-secondary hover:underline'}`}>
                          {isLimitReached ? "Limit Reached" : "Upload File"}
                          {!isLimitReached && (
                            <input
                              type="file"
                              className="hidden"
                              accept="*"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  reportMutation.mutate({ taskId: row._id, file });
                                }
                              }}
                            />
                          )}
                        </label>
                        <span className="text-[10px] text-slate-400">({count}/3 uploaded)</span>
                      </div>
                    );
                  }
                }
              : {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex gap-3">
                      <button type="button" className="text-brand-secondary" onClick={() => setSelectedTaskId(row._id)}>
                        Reports
                      </button>
                      <button type="button" className="text-rose-300" onClick={() => deleteMutation.mutate(row._id)}>
                        Delete
                      </button>
                    </div>
                  )
                }
          ]}
          rows={tasks}
          emptyText="No tasks available."
        />
      </div>
    </div>
  );
};

export default TasksPage;
