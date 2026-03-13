const SectionHeading = ({ eyebrow, title, description, align = "left" }) => (
  <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
    <p className="mb-3 text-sm uppercase tracking-[0.35em] text-brand-secondary">{eyebrow}</p>
    <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
    {description ? <p className="mt-4 text-lg text-slate-300">{description}</p> : null}
  </div>
);

export default SectionHeading;
