import { motion } from "framer-motion";

const StatCard = ({ label, value, hint, icon: Icon }) => (
  <motion.div whileHover={{ y: -4 }} className="glass-panel relative overflow-hidden p-6 shadow-glow">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />
    <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 text-brand-secondary">
      <Icon size={18} />
    </div>
    <p className="text-sm text-slate-400">{label}</p>
    <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    <p className="mt-3 text-sm text-slate-300">{hint}</p>
  </motion.div>
);

export default StatCard;
