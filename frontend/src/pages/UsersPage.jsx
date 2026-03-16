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
  const isAdmin = role === "ADMIN";
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["users-page", isAdmin ? "students" : "all"],
    queryFn: () => atlasiaService.getUsers(isAdmin ? "STUDENT" : undefined)
  });
  const businessesQuery = useQuery({ queryKey: ["users-businesses"], queryFn: atlasiaService.getBusinesses });
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { role: isAdmin ? "STUDENT" : "ADMIN" }
  });
  const selectedRole = watch("role");
  const createMutation = useMutation({
    mutationFn: atlasiaService.createUser,
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
      reset({ role: "ADMIN", businessId: "", name: "", email: "", password: "" });
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

      {isAdmin ? (
        <div className="glass-panel p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Student Directory</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Platform Students</h2>
          <p className="mt-2 text-sm text-slate-300">View and manage students registered on the platform. To assign students to businesses, use the Task Management section.</p>
        </div>
      ) : (
        <div className="glass-panel p-6">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Name" {...register("name", { required: true })} />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Email" {...register("email", { required: true })} />
            <input type="password" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Password" {...register("password", { required: true })} />
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...register("role", { required: true })}>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
              <option value="SUPERADMIN">Superadmin</option>
            </select>
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...register("college")}>
              <option value="">Select College (Optional)</option>
              <option value="City College">City College</option>
              <option value="BMS College">BMS College</option>
              <option value="GIMS College">GIMS College</option>
              <option value="St Pheleomena">St Pheleomena</option>
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
          { key: "college", label: "College" },
          { key: "role", label: "Role" },
          { key: "businessId", label: "Business", render: (row) => row.businessId?.name || "-" }
        ]}
        rows={users}
        emptyText={isAdmin ? "No students available." : "No users available."}
      />
    </div>
  );
};

export default UsersPage;
