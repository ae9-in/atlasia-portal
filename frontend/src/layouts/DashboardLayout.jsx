import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, ClipboardCheck, LayoutDashboard, LogOut, Settings, UserCircle2, Users2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../store/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { normalizeRole } from "../utils/roles";

const navigationByRole = {
  STUDENT: [
    { label: "Dashboard", to: "/workspace" },
    { label: "My Tasks", to: "/workspace/tasks" },
    { label: "Profile", to: "/workspace/profile" }
  ],
  COORDINATOR: [
    { label: "Dashboard", to: "/workspace" },
    { label: "Tasks", to: "/workspace/tasks" },
    { label: "Businesses", to: "/workspace/businesses" },
    { label: "Sprints", to: "/workspace/sprints" },
    { label: "Students", to: "/workspace/users" },
    { label: "Profile", to: "/workspace/profile" }
  ],
  SUPER_ADMIN: [
    { label: "Dashboard", to: "/workspace" },
    { label: "Users", to: "/workspace/users" },
    { label: "Businesses", to: "/workspace/businesses" },
    { label: "Sprints", to: "/workspace/sprints" },
    { label: "Tasks", to: "/workspace/tasks" },
    { label: "Settings", to: "/workspace/settings" },
    { label: "Profile", to: "/workspace/profile" }
  ]
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useTheme();

  const role = normalizeRole(user?.role);
  const navigation = navigationByRole[role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-hero-mesh">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="section-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/workspace" className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary p-3 text-white">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Atlasia Workbook</p>
              <p className="text-2xl font-bold text-white">{role?.replace("_", " ") || "Workspace"}</p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {navigation.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/workspace"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <button type="button" onClick={handleLogout} className="glass-panel inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="section-container py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
