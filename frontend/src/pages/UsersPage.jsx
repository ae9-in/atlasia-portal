import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";

const UsersPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isCoordinator = role === "COORDINATOR";
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["users-page", isCoordinator ? "students" : "all"],
    queryFn: () => atlasiaService.getUsers(isCoordinator ? "STUDENT" : undefined)
  });
  const businessesQuery = useQuery({ queryKey: ["users-businesses"], queryFn: atlasiaService.getBusinesses });
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { role: isCoordinator ? "STUDENT" : "COORDINATOR" }
  });
  const selectedRole = watch("role");
  const createMutation = useMutation({
    mutationFn: atlasiaService.createUser,
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
      reset({ role: "COORDINATOR", businessId: "", name: "", email: "", password: "" });
    }
  });
  const assignMutation = useMutation({
    mutationFn: ({ userId, businessId }) => atlasiaService.assignStudentBusiness(userId, businessId),
    onSuccess: () => {
      toast.success("Student business updated");
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
    }
  });

  if (usersQuery.isLoading || businessesQuery.isLoading) return <LoadingScreen />;

  const users = usersQuery.data?.users || [];
  const businesses = businessesQuery.data?.businesses || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Users</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Role-based account management</h1>
      </div>

      {isCoordinator ? (
        <div className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Student Assignment</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Assign students to businesses</h2>
          <p className="mt-2 text-sm text-slate-300">Coordinators can update business ownership for existing student accounts, but cannot create new users.</p>
          <div className="mt-6 space-y-3">
            {users.length ? users.map((student) => (
              <div key={student._id} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-[1.1fr_0.9fr_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-white">{student.name}</p>
                  <p className="text-sm text-slate-400">{student.email}</p>
                </div>
                <select
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                  value={student.businessId?._id || ""}
                  onChange={(event) => assignMutation.mutate({ userId: student._id, businessId: event.target.value })}
                  disabled={assignMutation.isPending}
                >
                  <option value="" disabled>Select business</option>
                  {businesses.map((item) => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
                <div className="text-sm text-slate-400 lg:text-right">
                  Current: <span className="text-slate-200">{student.businessId?.name || "Unassigned"}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-slate-400">
                No students available.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Name" {...register("name", { required: true })} />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Email" {...register("email", { required: true })} />
            <input type="password" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Password" {...register("password", { required: true })} />
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...register("role", { required: true })}>
              <option value="COORDINATOR">Coordinator</option>
              <option value="STUDENT">Student</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            {selectedRole === "STUDENT" ? (
              <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white lg:col-span-2" {...register("businessId", { required: true })}>
                <option value="">Assign business</option>
                {businesses.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            ) : null}
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white lg:col-span-2" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      )}

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "businessId", label: "Business", render: (row) => row.businessId?.name || "-" }
        ]}
        rows={users}
        emptyText={isCoordinator ? "No students available." : "No users available."}
      />
    </div>
  );
};

export default UsersPage;
