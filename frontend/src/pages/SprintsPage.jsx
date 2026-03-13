import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import LoadingScreen from "../components/LoadingScreen";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";
import { formatDate } from "../utils/format";

const SprintsPage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const queryClient = useQueryClient();
  const sprintsQuery = useQuery({ queryKey: ["sprints-page"], queryFn: atlasiaService.getSprints });
  const { register, handleSubmit, reset } = useForm();
  const createMutation = useMutation({
    mutationFn: atlasiaService.createSprint,
    onSuccess: () => {
      toast.success("Sprint created");
      queryClient.invalidateQueries({ queryKey: ["sprints-page"] });
      reset();
    }
  });

  if (sprintsQuery.isLoading) return <LoadingScreen />;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Sprints</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Working cycles for Atlasia Workbook</h1>
      </div>
      {role !== "STUDENT" ? (
        <div className="glass-panel p-6">
          <form className="grid gap-4 lg:grid-cols-3" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Sprint name" {...register("name", { required: true })} />
            <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("startDate", { required: true })} />
            <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" {...register("endDate", { required: true })} />
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white lg:col-span-3">Create Sprint</button>
          </form>
        </div>
      ) : null}
      <DataTable columns={[{ key: "name", label: "Name" }, { key: "startDate", label: "Start", render: (row) => formatDate(row.startDate) }, { key: "endDate", label: "End", render: (row) => formatDate(row.endDate) }]} rows={sprintsQuery.data?.sprints || []} emptyText="No sprints created yet." />
    </div>
  );
};

export default SprintsPage;
