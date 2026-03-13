import { motion } from "framer-motion";

const LoadingScreen = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <motion.div
      className="h-16 w-16 rounded-full border-4 border-brand-secondary/20 border-t-brand-primary"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  </div>
);

export default LoadingScreen;
