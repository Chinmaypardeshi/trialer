import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function BarChart({
  data = [],
  valuePrefix = '',
  valueSuffix = '',
  height = 270,
  barColor = '#f97316',
  onBarClick = null,
  orientation = 'vertical', // 'vertical' or 'horizontal'
}) {
  const { isDark } = useTheme();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 text-slate-400 text-sm"
        style={{ height }}
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-2">
          📊
        </div>
        <p className="font-medium">No category data available</p>
      </div>
    );
  }

  // Calculate maximum value for scaling
  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const totalValue = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const formatShortNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString('en-IN');
  };

  // ==========================================
  // HORIZONTAL ORIENTATION (Zero Overlap Guaranteed)
  // ==========================================
  if (orientation === 'horizontal') {
    return (
      <div className="w-full space-y-2.5 py-2">
        {data.map((item, idx) => {
          const val = Number(item.value) || 0;
          const pctOfMax = (val / maxValue) * 100;
          const pctOfTotal = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onClick={() => onBarClick && onBarClick(item, idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isHovered ? 'bg-orange-50/80 shadow-xs' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] inline-flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <span
                    className={`font-semibold truncate transition ${
                      isHovered ? 'text-orange-600 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900">
                    {valuePrefix}
                    {val.toLocaleString('en-IN')}
                    {valueSuffix}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1.5">
                    ({pctOfTotal}%)
                  </span>
                </div>
              </div>

              {/* Bar track and fill */}
              <div
                className="w-full rounded-full overflow-hidden"
                style={{
                  height: '14px',
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
                }}
              >
                <div
                  className="rounded-full transition-all duration-500"
                  style={{
                    height: '100%',
                    width: `${Math.max(pctOfMax, 2.5)}%`,
                    backgroundColor: '#ea580c',
                    background: isHovered
                      ? 'linear-gradient(90deg, #fb923c 0%, #ea580c 100%)'
                      : 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: isHovered
                      ? '0 2px 8px rgba(234, 88, 12, 0.55)'
                      : '0 1px 4px rgba(234, 88, 12, 0.35)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ==========================================
  // VERTICAL ORIENTATION (Adaptive & Consistent)
  // ==========================================
  const numBars = data.length;
  // Angle labels when there are more than 4 bars to ensure parallel clearance
  const shouldAngleLabels = numBars > 4;
  const isFewBars = numBars <= 3;

  const padLeft = 45;
  const padRight = 25;
  const padTop = 35;
  // Extra bottom padding for angled diagonal labels
  const padBottom = shouldAngleLabels ? 95 : (isFewBars ? 55 : 45);

  // Proportional SVG width:
  // For 1-3 bars: Keep SVG compact so bars don't sit in a massive empty void
  // For 4+ bars: Give enough width for comfortable slot spacing
  const svgWidth = isFewBars
    ? Math.min(520, Math.max(360, numBars * 150))
    : Math.max(620, numBars * 62);

  const svgHeight = height + (shouldAngleLabels ? 50 : (isFewBars ? 15 : 0));

  const chartW = svgWidth - padLeft - padRight;
  const chartH = height - padTop - 40; // Plotting height

  const slotWidth = chartW / numBars;
  // Proportional bar width so few bars look grounded and many bars look crisp
  const barWidth = isFewBars
    ? Math.min(Math.max(slotWidth * 0.35, 36), 56)
    : Math.min(Math.max(slotWidth * 0.52, 16), 44);

  // 4 Horizontal grid lines
  const gridSteps = [0, 0.33, 0.66, 1];

  // Helper to split long label for un-angled view (e.g. "Maharashtrian Thali")
  const formatUnangledLabel = (label) => {
    if (!label) return [''];
    if (label.length <= 13) return [label];
    // Split on space if possible
    const spaceIdx = label.indexOf(' ');
    if (spaceIdx > 0 && spaceIdx < 16) {
      return [label.slice(0, spaceIdx), label.slice(spaceIdx + 1)];
    }
    // Truncate cleanly if single huge word
    return [label.length > 15 ? label.slice(0, 14) + '…' : label];
  };

  return (
    <div className="w-full relative">
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: numBars > 10 ? `${numBars * 58}px` : '100%' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full overflow-visible"
            style={{ height: 'auto', maxHeight: svgHeight + 20 }}
          >
            <defs>
              {/* Bar Gradient */}
              <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fdba74" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>

              {/* Bar Shadow */}
              <filter id="barShadow" x="-15%" y="-10%" width="130%" height="130%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="4"
                  floodColor="#ea580c"
                  floodOpacity="0.25"
                />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-axis labels */}
            {gridSteps.map((step, idx) => {
              const y = padTop + chartH - step * chartH;
              const labelVal = Math.round(step * maxValue);
              return (
                <g key={idx} className="text-slate-300">
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke={isDark ? '#1e293b' : '#f1f5f9'}
                    strokeWidth="1"
                    strokeDasharray={idx === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] font-medium"
                    fill={isDark ? '#94a3b8' : '#94a3b8'}
                  >
                    {formatShortNumber(labelVal)}
                  </text>
                </g>
              );
            })}

            {/* Bars and Labels */}
            {data.map((item, idx) => {
              const val = Number(item.value) || 0;
              const barHeight = Math.max((val / maxValue) * chartH, 4);
              const x = padLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
              const y = padTop + chartH - barHeight;
              const isHovered = hoveredIdx === idx;
              const pctOfTotal =
                totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;

              // Angled display label: up to 18 characters
              const angledLabel =
                item.label && item.label.length > 18
                  ? item.label.slice(0, 17) + '…'
                  : item.label || '';

              // Unangled lines
              const unangledLines = formatUnangledLabel(item.label);

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => onBarClick && onBarClick(item, idx)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Invisible wider hit area for easy hover on mobile/desktop */}
                  <rect
                    x={padLeft + idx * slotWidth}
                    y={padTop}
                    width={slotWidth}
                    height={chartH + padBottom}
                    fill="transparent"
                  />

                  {/* Background slot bar (subtle) */}
                  <rect
                    x={x}
                    y={padTop}
                    width={barWidth}
                    height={chartH}
                    rx="6"
                    fill={isDark ? '#1e293b' : '#f8fafc'}
                  />

                  {/* The Actual Data Bar: Stationary, highlights on hover without stretching */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradientPrimary)'}
                    filter={isHovered ? 'url(#barShadow)' : 'none'}
                    className="transition-colors duration-200"
                  />

                  {/* Value Label above bar: Rock-solid stationary, zero jumping */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className={`text-[10.5px] font-bold transition-colors duration-150 ${
                      isHovered ? 'fill-orange-500 font-extrabold' : (isDark ? 'fill-slate-300' : 'fill-slate-600')
                    }`}
                  >
                    {formatShortNumber(val)}
                  </text>

                  {/* Category Label: Angled View (when > 4 bars) */}
                  {shouldAngleLabels ? (
                    <text
                      x={x + barWidth / 2}
                      y={padTop + chartH + 14}
                      textAnchor="end"
                      transform={`rotate(-40, ${x + barWidth / 2}, ${padTop + chartH + 14})`}
                      className={`text-[10.5px] font-medium transition-colors ${
                        isHovered ? 'fill-orange-500 font-bold' : (isDark ? 'fill-slate-200' : 'fill-slate-700')
                      }`}
                    >
                      {angledLabel}
                      <tspan dx="6" className={`text-[9.5px] font-semibold ${isDark ? 'fill-slate-400' : 'fill-slate-400'}`}>
                        ({pctOfTotal}%)
                      </tspan>
                    </text>
                  ) : (
                    /* Category Label: Un-angled Multiline View (when <= 4 bars) */
                    <g className="transition-colors">
                      {unangledLines.map((line, lineIdx) => (
                        <text
                          key={lineIdx}
                          x={x + barWidth / 2}
                          y={padTop + chartH + 16 + lineIdx * 13}
                          textAnchor="middle"
                          className={`text-[11px] font-semibold ${
                            isHovered ? 'fill-orange-500' : (isDark ? 'fill-slate-100' : 'fill-slate-800')
                          }`}
                        >
                          {line}
                        </text>
                      ))}
                      {/* Percentage sublabel */}
                      <text
                        x={x + barWidth / 2}
                        y={padTop + chartH + 16 + unangledLines.length * 13}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-semibold"
                      >
                        {pctOfTotal}% ({val.toLocaleString('en-IN')})
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Baseline */}
            <line
              x1={padLeft}
              y1={padTop + chartH}
              x2={svgWidth - padRight}
              y2={padTop + chartH}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>

      {/* Stable Status / Hover Strip with Fixed Height (Never Jumps the Layout) */}
      <div className="mt-2 h-10 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-slate-50 flex items-center justify-between text-xs transition-colors">
        {hoveredIdx !== null && data[hoveredIdx] ? (
          <>
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
              <span className="font-bold text-slate-800 truncate">
                {data[hoveredIdx].label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-extrabold text-orange-600">
                {valuePrefix}
                {Number(data[hoveredIdx].value).toLocaleString('en-IN')}
                {valueSuffix}
              </span>
              <span className="text-slate-500 font-medium text-[11px]">
                ({totalValue > 0
                  ? ((Number(data[hoveredIdx].value) / totalValue) * 100).toFixed(1)
                  : 0}% volume)
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 font-medium w-full justify-center">
            <span>💡 Hover over any bar or item for detailed volume metrics</span>
          </div>
        )}
      </div>
    </div>
  );
}
