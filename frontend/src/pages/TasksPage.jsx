import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import UploadDropzone from "../components/UploadDropzone";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";
import { formatDate } from "../utils/format";

const TasksPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState(null);

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

  const { register, handleSubmit, reset, watch } = useForm();
  const commentForm = useForm();
  const students = studentsQuery.data?.users || [];
  const selectedStudentId = watch("assignedTo");
  const selectedStudent = students.find((item) => item._id === selectedStudentId);
  const selectedBusinessName = selectedStudent?.businessId?.name || "Select a student to load the business";

  if (tasksQuery.isLoading || sprintsQuery.isLoading || studentsQuery.isLoading) {
    return <LoadingScreen />;
  }

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
              await createMutation.mutateAsync({ ...values, attachments: [] });
              reset();
            })}
          >
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Title" {...register("title", { required: true })} />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Expected Outcome" {...register("expectedOutcome", { required: true })} />
            <textarea className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white lg:col-span-2" placeholder="Description" {...register("description", { required: true })} />
            <input type="number" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Days Required" {...register("daysRequired", { required: true })} />
            <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("deadlineDate", { required: true })} />
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white lg:col-span-2" {...register("assignedTo", { required: true })}>
              <option value="">Assign to student</option>
              {students.map((item) => (
                <option key={item._id} value={item._id}>{item.name} - {item.email}</option>
              ))}
            </select>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Business</p>
              <p className="mt-2 text-base text-white">{selectedBusinessName}</p>
            </div>
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...register("sprintId", { required: true })}>
              <option value="">Select sprint</option>
              {(sprintsQuery.data?.sprints || []).map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white lg:col-span-2" disabled={createMutation.isPending || !selectedStudent?.businessId?._id}>
              {createMutation.isPending ? "Creating Task..." : "Create Task"}
            </button>
          </form>
        </div>
      ) : null}

      <DataTable
        columns={[
          { key: "title", label: "Task Info", render: (row) => (
            <div className="max-w-[16rem] lg:max-w-xs">
              <p className="font-semibold text-white">{row.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400" title={row.description}>{row.description}</p>
              {row.expectedOutcome && (
                <p className="mt-1 line-clamp-1 text-xs text-brand-secondary" title={row.expectedOutcome}>
                  <span className="opacity-75">Target:</span> {row.expectedOutcome}
                </p>
              )}
            </div>
          ) },
          ...(role !== "STUDENT" ? [{ key: "student", label: "Assigned To", render: (row) => row.assignedTo?.name || "-" }] : []),
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
          role === "STUDENT"
            ? {
                key: "report",
                label: "Upload Report",
                render: (row) => (
                  <label className="cursor-pointer text-brand-secondary">
                    Upload ZIP
                    <input
                      type="file"
                      className="hidden"
                      accept=".zip"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          reportMutation.mutate({ taskId: row._id, file });
                        }
                      }}
                    />
                  </label>
                )
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

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="glass-panel p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-white">Task comments</h2>
          
          <div className="mt-6 flex-1">
            <select className="mb-4 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...commentForm.register("taskId", { required: true })}>
              <option value="">Select task</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>{task.title}</option>
              ))}
            </select>

            {selectedCommentTask ? (
              <div className="mb-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                  <h3 className="font-bold text-white mb-2">{selectedCommentTask.title}</h3>
                  <p className="text-sm text-slate-300 mb-4 whitespace-pre-wrap">{selectedCommentTask.description}</p>
                  {selectedCommentTask.expectedOutcome && (
                    <div className="rounded-xl bg-brand-primary/10 p-3 border border-brand-primary/20">
                      <p className="text-xs uppercase tracking-[0.2em] text-brand-secondary mb-1">Expected Outcome</p>
                      <p className="text-sm text-white/90">{selectedCommentTask.expectedOutcome}</p>
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

          <form
            className="mt-auto space-y-4"
            onSubmit={commentForm.handleSubmit(async (values) => {
              await commentMutation.mutateAsync(values);
              commentForm.setValue("message", "");
            })}
          >
            <textarea className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" rows={3} placeholder="Write a comment" {...commentForm.register("message", { required: true })} />
            <button type="submit" className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:opacity-50" disabled={!selectedCommentTaskId || commentMutation.isPending}>
              {commentMutation.isPending ? "Adding..." : "Add Comment"}
            </button>
          </form>
        </div>

        {role !== "STUDENT" ? (
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">Task reports</h2>
            <div className="mt-6 space-y-3">
              {(reportsQuery.data?.reports || []).map((report) => (
                <div key={report._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{report.studentId?.name}</p>
                  <p className="mt-2 text-sm text-slate-300">{report.taskId?.title}</p>
                  <a className="mt-3 inline-block text-brand-secondary" href={`${import.meta.env.VITE_API_URL || ""}/api/reports/download/${report._id}`}>
                    Download report
                  </a>
                </div>
              ))}
              {!reportsQuery.data?.reports?.length ? <p className="text-slate-400">Select a task to inspect reports.</p> : null}
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">Upload guidance</h2>
            <div className="mt-6">
              <UploadDropzone onFileSelect={() => {}} disabled />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
