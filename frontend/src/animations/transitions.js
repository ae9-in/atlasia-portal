export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" }
  }
};

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};
