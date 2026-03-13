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
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["users-page"], queryFn: () => atlasiaService.getUsers() });
  const businessesQuery = useQuery({ queryKey: ["users-businesses"], queryFn: atlasiaService.getBusinesses });
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { role: role === "COORDINATOR" ? "STUDENT" : "COORDINATOR" }
  });
  const selectedRole = watch("role");
  const createMutation = useMutation({
    mutationFn: atlasiaService.createUser,
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["users-page"] });
      reset();
    }
  });

  if (usersQuery.isLoading || businessesQuery.isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Users</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Role-based account management</h1>
      </div>
      <div className="glass-panel p-6">
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Name" {...register("name", { required: true })} />
          <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Email" {...register("email", { required: true })} />
          <input type="password" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Password" {...register("password", { required: true })} />
          <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" {...register("role", { required: true })}>
            {role === "SUPER_ADMIN" ? (
              <>
                <option value="COORDINATOR">Coordinator</option>
                <option value="STUDENT">Student</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </>
            ) : (
              <option value="STUDENT">Student</option>
            )}
          </select>
          {selectedRole === "STUDENT" ? (
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white lg:col-span-2" {...register("businessId", { required: true })}>
              <option value="">Assign business</option>
              {(businessesQuery.data?.businesses || []).map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          ) : null}
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white lg:col-span-2">Create User</button>
        </form>
      </div>
      <DataTable columns={[{ key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "businessId", label: "Business", render: (row) => row.businessId?.name || "-" }]} rows={usersQuery.data?.users || []} emptyText="No users available." />
    </div>
  );
};

export default UsersPage;
