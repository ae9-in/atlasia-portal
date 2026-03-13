import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";

const BusinessesPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const queryClient = useQueryClient();
  const businessesQuery = useQuery({ queryKey: ["businesses-page"], queryFn: atlasiaService.getBusinesses });
  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: atlasiaService.createBusiness,
    onSuccess: () => {
      toast.success("Business created");
      queryClient.invalidateQueries({ queryKey: ["businesses-page"] });
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: atlasiaService.deleteBusiness,
    onSuccess: () => {
      toast.success("Business deleted");
      queryClient.invalidateQueries({ queryKey: ["businesses-page"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to delete business");
    }
  });

  if (businessesQuery.isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Businesses</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Atlasia business workstreams</h1>
      </div>
      {role !== "STUDENT" ? (
        <div className="glass-panel p-6">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Business name" {...register("name", { required: true })} />
            <textarea className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white lg:col-span-2" placeholder="Description" {...register("description", { required: true })} />
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white lg:col-span-2">Create Business</button>
          </form>
        </div>
      ) : null}
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "description", label: "Description" },
          ...(role !== "STUDENT"
            ? [
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <button
                      type="button"
                      className="rounded-full bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete "${row.name}"? This cannot be undone.`)) {
                          deleteMutation.mutate(row._id);
                        }
                      }}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  )
                }
              ]
            : [])
        ]}
        rows={businessesQuery.data?.businesses || []}
        emptyText="No businesses created yet."
      />
    </div>
  );
};

export default BusinessesPage;
