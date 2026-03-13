import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileArchive, UploadCloud } from "lucide-react";
import { cn } from "../utils/cn";

const UploadDropzone = ({ onFileSelect, disabled }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        if (!disabled) {
          handleFile(event.dataTransfer.files?.[0]);
        }
      }}
      className={cn(
        "glass-panel flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-12 text-center transition",
        isDragging ? "border-brand-secondary bg-brand-secondary/10" : "border-white/10",
        disabled && "cursor-not-allowed opacity-60"
      )}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
        disabled={disabled}
      />
      <div className="mb-5 rounded-full bg-white/10 p-4 text-brand-secondary">
        {isDragging ? <FileArchive size={28} /> : <UploadCloud size={28} />}
      </div>
      <h3 className="text-xl font-semibold text-white">Upload Daily Report (.zip only)</h3>
      <p className="mt-3 max-w-md text-sm text-slate-300">
        Drag and drop a report archive or click to browse. Maximum size 25MB and only one submission is allowed per day.
      </p>
    </motion.div>
  );
};

export default UploadDropzone;
