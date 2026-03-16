import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { formatDate } from "../utils/format";

const TaskBoard = ({ tasks }) => (
  <div className="glass-panel p-6">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-secondary">Today's Tasks</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Public task board</h3>
      </div>
      <CalendarDays className="text-brand-secondary" />
    </div>
    <div className="space-y-4">
      {tasks?.length ? (
        tasks.slice(0, 4).map((task, index) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 text-brand-accent" size={18} />
              <div>
                <p className="font-semibold text-white">{task.title}</p>
                <p className="mt-2 text-sm text-slate-300">{task.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Deadline {formatDate(task.deadlineDate)}
                </p>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-slate-400">
          No tasks have been assigned yet.
        </p>
      )}
    </div>
  </div>
);

export default TaskBoard;
