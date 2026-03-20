import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, UploadCloud, AlertCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { dailyReportService } from "../services/dailyReportService";
import UploadDropzone from "./UploadDropzone";
import { motion, AnimatePresence } from "framer-motion";

const DailyReportCard = () => {
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ["today-report-status"],
    queryFn: dailyReportService.getTodayStatus,
    refetchInterval: 60000 // Refetch every 60 seconds
  });

  const uploadMutation = useMutation({
    mutationFn: dailyReportService.upload,
    onSuccess: () => {
      toast.success("Daily report submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["today-report-status"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to upload report");
    }
  });

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be 25MB or smaller");
      return;
    }
    uploadMutation.mutate(file);
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-12 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
      </div>
    );
  }

  const report = status?.report;
  const isSubmitted = status?.submitted && report?.status !== "RESUBMIT_REQUESTED";
  const isResubmitRequested = report?.status === "RESUBMIT_REQUESTED";

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!status?.submitted || isResubmitRequested ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {isResubmitRequested && (
              <div className="flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <AlertCircle className="mt-1 text-amber-500" size={20} />
                <div>
                  <h4 className="font-bold text-white">Resubmission Required</h4>
                  <p className="mt-1 text-sm text-amber-200/80">
                    The administrator has requested a resubmission for today's report.
                  </p>
                  {report.adminNote && (
                    <div className="mt-3 rounded-xl bg-amber-500/10 p-3 italic text-xs text-amber-300">
                      " {report.adminNote} "
                    </div>
                  )}
                </div>
              </div>
            )}
            <UploadDropzone 
              onFileSelect={handleFileSelect} 
              disabled={uploadMutation.isPending}
            />
            {uploadMutation.isPending && (
              <p className="text-center text-sm text-brand-secondary animate-pulse">Uploading report...</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 flex flex-col items-center text-center"
          >
            <div className="mb-4 rounded-full bg-emerald-500/20 p-4 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white">Daily Report Submitted</h3>
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Clock size={14} />
                Submitted at {new Date(report.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                  report.status === "REVIEWED" ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-primary/20 text-brand-secondary"
                )}>
                  {report.status}
                </span>
              </div>
              
              
              <p className="mt-4 text-[10px] text-slate-500 italic max-w-xs">
                File: {report.originalFileName} ({(report.fileSize / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default DailyReportCard;
