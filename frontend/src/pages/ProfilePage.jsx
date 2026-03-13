import { useAuth } from "../store/AuthContext";
import { normalizeRole } from "../utils/roles";

const ProfilePage = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  return (
    <div className="glass-panel p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Profile</p>
      <h1 className="mt-2 text-4xl font-bold text-white">{user?.name}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Email</p>
          <p className="mt-2 text-lg text-white">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Role</p>
          <p className="mt-2 text-lg text-white">{role}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
          <p className="text-sm text-slate-400">Business</p>
          <p className="mt-2 text-lg text-white">{user?.businessId?.name || "Not assigned"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
