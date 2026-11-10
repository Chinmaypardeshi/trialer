const GRADIENT_PRESETS = {
  'from-emerald-500 to-teal-600': {
    box: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
    bar: 'linear-gradient(90deg, #10b981 0%, #0d9488 100%)',
    shadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
  },
  'from-blue-500 to-indigo-600': {
    box: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
    bar: 'linear-gradient(90deg, #3b82f6 0%, #4f46e5 100%)',
    shadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
  },
  'from-amber-500 to-orange-600': {
    box: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    bar: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
    shadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
  },
  'from-rose-500 to-red-600': {
    box: 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)',
    bar: 'linear-gradient(90deg, #f43f5e 0%, #dc2626 100%)',
    shadow: '0 4px 12px rgba(244, 63, 94, 0.35)',
  },
  'from-indigo-500 to-purple-600': {
    box: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
    bar: 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
    shadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
  },
  'from-amber-500 to-rose-600': {
    box: 'linear-gradient(135deg, #f59e0b 0%, #e11d48 100%)',
    bar: 'linear-gradient(90deg, #f59e0b 0%, #e11d48 100%)',
    shadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
  },
  'from-orange-500 to-amber-600': {
    box: 'linear-gradient(135deg, #f97316 0%, #d97706 100%)',
    bar: 'linear-gradient(90deg, #f97316 0%, #d97706 100%)',
    shadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
  },
};

export default function DashboardCard({
  title,
  value,
  subtext,
  icon,
  gradient = 'from-orange-500 to-amber-600',
  textColor = 'text-white',
  bgLight = 'bg-white',
  badge = null,
}) {
  const preset = GRADIENT_PRESETS[gradient] || GRADIENT_PRESETS['from-orange-500 to-amber-600'];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-200"
            style={{
              background: preset.box,
              boxShadow: preset.shadow,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-4">
        <p className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          {value !== undefined && value !== null ? value : '—'}
        </p>
      </div>

      {/* Bottom row: Subtext & Badge */}
      <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400 font-medium">{subtext}</span>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.color || 'bg-emerald-50 text-emerald-700'}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Subtle top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-90"
        style={{ background: preset.bar }}
      />
    </div>
  );
}
