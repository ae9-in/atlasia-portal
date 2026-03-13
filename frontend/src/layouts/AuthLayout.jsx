import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FloatingBackground from "../components/FloatingBackground";

const AuthLayout = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
    <FloatingBackground />
    <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
      <Link to="/" className="glass-panel inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
        <ArrowLeft size={16} />
        Go back to home
      </Link>
    </div>
    <div className="glass-panel relative z-10 w-full max-w-md p-8 shadow-glow">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
