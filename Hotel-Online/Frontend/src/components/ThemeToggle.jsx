import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (currently ${isDark ? 'Dark' : 'Light'})`}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer border ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-inner'
          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={16} className="text-amber-400 animate-in spin-in-180 duration-300" />
        ) : (
          <Moon size={16} className="text-slate-700 animate-in spin-in-180 duration-300" />
        )}
      </div>

      {showLabel ? (
        <span className="tracking-wide select-none">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      ) : (
        <span className="hidden md:inline tracking-wide select-none">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}

      {/* Mini status indicator dot */}
      <span
        className={`w-2 h-2 rounded-full transition-colors ${
          isDark ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-400'
        }`}
      />
    </button>
  );
}
