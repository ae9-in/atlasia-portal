import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../store/AuthContext";

const RegisterPage = () => {
  const { user } = useAuth();
  const { isAuthReady } = useAuth();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthReady && user) {
    return <Navigate to="/workspace" replace />;
  }

  const onSubmit = async (values) => {
    const nextUser = await registerUser({ ...values, role: "STUDENT" });
    toast.success(`Account created for ${nextUser.name}`);
    navigate("/workspace");
  };

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Create Account</p>
      <h1 className="mt-4 text-3xl font-bold text-white">Join Atlasia Workbook</h1>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Full name" {...register("name", { required: "Name is required" })} />
        </div>
        <div>
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Email" {...register("email", { required: "Email is required" })} />
        </div>
        <div>
          <select 
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white [&>option]:text-slate-900 appearance-none" 
            {...register("college", { required: "College is required" })}
            defaultValue=""
          >
            <option value="" disabled className="text-slate-400">Select College</option>
            <option value="City College">City College</option>
            <option value="BMS College">BMS College</option>
            <option value="GIMS College">GIMS College</option>
            <option value="St Pheleomena">St Pheleomena</option>
          </select>
          {errors.college ? <p className="mt-2 text-sm text-rose-300">{errors.college.message}</p> : null}
        </div>
        <div>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white" placeholder="Password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors flex items-center justify-center">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password ? <p className="mt-2 text-sm text-rose-300">{errors.password.message}</p> : null}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-semibold text-white">
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-400">
        Already registered? <Link to="/auth/login" className="text-brand-secondary">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;

