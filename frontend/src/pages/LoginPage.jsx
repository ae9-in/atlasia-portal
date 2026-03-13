import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../store/AuthContext";

const LoginPage = () => {
  const { user } = useAuth();
  const { isAuthReady } = useAuth();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (isAuthReady && user) {
    return <Navigate to="/workspace" replace />;
  }

  const onSubmit = async (values) => {
    const nextUser = await login(values);
    toast.success(`Welcome back, ${nextUser.name}`);
    navigate("/workspace");
  };

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Welcome Back</p>
      <h1 className="mt-4 text-3xl font-bold text-white">Login to Atlasia Workbook</h1>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Email" {...register("email", { required: "Email is required" })} />
          {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p> : null}
        </div>
        <div>
          <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Password" {...register("password", { required: "Password is required" })} />
          {errors.password ? <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p> : null}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white">
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        Need an account? <Link to="/auth/register" className="text-brand-secondary">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;

