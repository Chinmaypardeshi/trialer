import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function PieChart({
  data = [],
  title = 'Distribution',
  centerLabel = 'Total',
  centerValue = null,
  height = 300,
  onSliceClick = null,
}) {
  const { isDark } = useTheme();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const defaultColors = [
    '#f97316', // orange
    '#10b981', // emerald
    '#6366f1', // indigo
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#8b5cf6', // purple
    '#eab308', // yellow
    '#f43f5e', // rose
  ];

  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-slate-400 text-sm"
        style={{ height }}
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
          📊
        </div>
        <p className="font-medium">No distribution data for this period</p>
      </div>
    );
  }

  // Geometry
  const cx = 140;
  const cy = 140;
  const outerR = 95;
  const innerR = 60;
  const hoverOffset = 6;

  let currentAngle = -90; // Start at 12 o'clock

  const slices = data.map((item, idx) => {
    const value = Number(item.value) || 0;
    const fraction = total > 0 ? value / total : 0;
    const angle = fraction * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const midAngle = startAngle + angle / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const dx = Math.cos(midRad) * hoverOffset;
    const dy = Math.sin(midRad) * hoverOffset;

    // Single item taking 100% of pie
    const isFullCircle = fraction >= 0.9999;

    let pathD = '';
    if (isFullCircle) {
      // Draw complete donut using 2 arcs
      pathD = `
        M ${cx} ${cy - outerR}
        A ${outerR} ${outerR} 0 1 1 ${cx} ${cy + outerR}
        A ${outerR} ${outerR} 0 1 1 ${cx} ${cy - outerR}
        M ${cx} ${cy - innerR}
        A ${innerR} ${innerR} 0 1 0 ${cx} ${cy + innerR}
        A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR}
        Z
      `;
    } else if (angle > 0) {
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = cx + outerR * Math.cos(startRad);
      const y1 = cy + outerR * Math.sin(startRad);
      const x2 = cx + outerR * Math.cos(endRad);
      const y2 = cy + outerR * Math.sin(endRad);

      const x3 = cx + innerR * Math.cos(endRad);
      const y3 = cy + innerR * Math.sin(endRad);
      const x4 = cx + innerR * Math.cos(startRad);
      const y4 = cy + innerR * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      pathD = `
        M ${x1} ${y1}
        A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `;
    }

    const color = item.color || defaultColors[idx % defaultColors.length];
    const percentage = (fraction * 100).toFixed(1);

    return {
      ...item,
      value,
      color,
      percentage,
      pathD,
      dx,
      dy,
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col items-center">
      {/* SVG Canvas */}
      <div className="relative">
        <svg
          viewBox="0 0 280 280"
          className="w-56 h-56 sm:w-64 sm:h-64 transition-transform duration-300"
        >
          <defs>
            <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Slices */}
          {slices.map((slice, idx) => {
            if (!slice.pathD) return null;
            const isHovered = hoveredIdx === idx;
            return (
              <path
                key={idx}
                d={slice.pathD}
                fill={slice.color}
                className="transition-all duration-200 cursor-pointer"
                style={{
                  transform: isHovered
                    ? `translate(${slice.dx}px, ${slice.dy}px)`
                    : 'translate(0px, 0px)',
                  filter: isHovered ? 'url(#pieGlow)' : 'none',
                  opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                }}
                onClick={() => onSliceClick && onSliceClick(slice, idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Center Donut Hole */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR - 1}
            fill={isDark ? '#111827' : '#ffffff'}
            className="pointer-events-none transition-colors duration-200"
          />

          {/* Center Text */}
          <g className="pointer-events-none">
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              className="text-[11px] font-medium tracking-wide uppercase"
              fill={isDark ? '#94a3b8' : '#94a3b8'}
            >
              {activeSlice ? activeSlice.label : centerLabel}
            </text>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              className="text-lg font-bold"
              fill={isDark ? '#f8fafc' : '#1e293b'}
            >
              {activeSlice
                ? `${activeSlice.percentage}%`
                : (centerValue !== null ? centerValue : total.toLocaleString('en-IN'))}
            </text>
            {activeSlice && (
              <text
                x={cx}
                y={cy + 30}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-semibold"
              >
                {activeSlice.value.toLocaleString('en-IN')} orders
              </text>
            )}
          </g>
        </svg>
      </div>

      {/* Legend: Single-Column Vertical List for Clean Readability without Text Collisions */}
      <div className="w-full mt-4 flex flex-col gap-1 pt-3 border-t border-slate-100 max-h-56 overflow-y-auto pr-1">
        {slices.map((slice, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onClick={() => onSliceClick && onSliceClick(slice, idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                isHovered ? 'bg-orange-50/80 scale-[1.01]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate mr-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: slice.color }}
                />
                <span className={`text-xs font-semibold truncate transition ${
                  isHovered ? 'text-orange-600 font-bold' : 'text-slate-700'
                }`}>
                  {slice.label}
                </span>
              </div>
              <div className="text-right shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {slice.value.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  ({slice.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
