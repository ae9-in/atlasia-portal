import { motion } from "framer-motion";

const blobs = [
  "left-[8%] top-[10%] h-40 w-40 bg-brand-primary/25",
  "right-[12%] top-[18%] h-56 w-56 bg-brand-secondary/20",
  "bottom-[8%] left-[25%] h-48 w-48 bg-brand-accent/20"
];

const FloatingBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {blobs.map((blob, index) => (
      <motion.div
        key={blob}
        className={`absolute rounded-full blur-3xl ${blob}`}
        animate={{ y: [0, -20, 12, 0], x: [0, 16, -10, 0] }}
        transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

export default FloatingBackground;
