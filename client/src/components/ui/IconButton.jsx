export default function IconButton({
  label,
  children,
  badge,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#00ff85]/40 hover:bg-[#00ff85]/10 hover:text-[#00ff85] ${className}`}
      {...props}
    >
      {children}
      {badge && (
        <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-violet-500 px-1 text-[10px] font-bold leading-4 text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
