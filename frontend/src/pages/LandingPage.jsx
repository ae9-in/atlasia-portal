import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, FolderKanban, ShieldCheck, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingBackground from "../components/FloatingBackground";
import SectionHeading from "../components/SectionHeading";
import { atlasiaService } from "../services/atlasiaService";
import { useAuth } from "../store/AuthContext";

const features = [
  { title: "Structured businesses", description: "Organize students under Atlasia businesses and keep work scoped cleanly.", icon: BriefcaseBusiness },
  { title: "Sprint-based delivery", description: "Run task cycles by sprint with deadlines, attachments, and expected outcomes.", icon: TimerReset },
  { title: "Strict task visibility", description: "Students only see the tasks assigned to them. Nothing leaks across accounts.", icon: ShieldCheck },
  { title: "Coordinator workflows", description: "Assign tasks, track submissions, comment on progress, and review outcomes.", icon: FolderKanban }
];

const LandingPage = () => {
  const { user, isAuthReady, initialize } = useAuth();
  const { data } = useQuery({ queryKey: ["public-businesses"], queryFn: atlasiaService.getBusinesses, enabled: !!user });

  useEffect(() => {
    if (!isAuthReady) {
      initialize();
    }
  }, [initialize, isAuthReady]);

  return (
    <div className="relative overflow-hidden">
      <FloatingBackground />
      <section className="section-container relative z-10 grid min-h-screen items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.25em] text-brand-secondary">
            Atlasia Workbook
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-4xl text-5xl font-bold leading-tight text-white sm:text-6xl">
            Track Student Productivity with Structured Task Management
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 max-w-2xl text-xl text-slate-300">
            Atlasia Workbook gives super admins, coordinators, and students a clean operational system for businesses, sprints, tasks, comments, and ZIP report submissions.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap gap-4">
            <Link to={user ? "/workspace" : "/auth/login"} className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 font-semibold text-white shadow-glow">
              {user ? "Open Workspace" : "Login"}
            </Link>
            <Link to={user ? "/workspace/tasks" : "/auth/register"} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10">
              {user ? "View Tasks" : "Register"}
            </Link>
          </motion.div>
        </div>
        <div className="glass-panel p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">About Platform</p>
          <h2 className="mt-4 text-3xl font-bold text-white">Built for role-based student operations</h2>
          <div className="mt-8 space-y-4">
            {(data?.businesses || [
              { _id: 1, name: "Atlasia Health", description: "Healthcare initiatives and delivery tasks." },
              { _id: 2, name: "Atlasia Education", description: "Learning programs and workbook execution." },
              { _id: 3, name: "Atlasia Fitness", description: "Fitness and engagement task cycles." }
            ]).slice(0, 3).map((business) => (
              <div key={business._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{business.name}</p>
                <p className="mt-2 text-sm text-slate-300">{business.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container py-24">
        <SectionHeading eyebrow="Capabilities" title="Modern SaaS controls for Atlasia coordinators and students" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div key={title} className="glass-panel p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-brand-secondary">
                <Icon size={18} />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-24">
        <SectionHeading eyebrow="How It Works" title="Three roles, one clean workbook system" align="center" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            "Super admins create businesses, sprints, coordinators, and review platform analytics.",
            "Coordinators create tasks, attach files, assign work to students, and monitor progress.",
            "Students see only their assigned tasks, comment on progress, and upload ZIP reports."
          ].map((step, index) => (
            <div key={step} className="glass-panel p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Step 0{index + 1}</p>
              <p className="mt-4 text-lg text-slate-200">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container py-24">
        <div className="glass-panel flex flex-col items-start justify-between gap-8 p-10 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-secondary">Login/Register CTA</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Operate Atlasia Workbook with secure role boundaries.</h2>
          </div>
          <Link to={user ? "/workspace" : "/auth/login"} className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-slate-950">
            {user ? "Go to Workspace" : "Get Started"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
