import { formatShortDate } from '@/lib/date-utils'

interface DataPoint {
  label: string
  value: number
}

interface SimpleChartProps {
  data: DataPoint[]
  height?: number
  unit?: string
}

export function SimpleChart({ data, height = 180, unit = 'lbs' }: SimpleChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-sm" style={{ height }}>
        No data yet
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="flex items-center justify-center flex-col gap-1" style={{ height }}>
        <span className="font-display font-bold text-2xl text-accent dark:text-accent-dark">
          {data[0].value}{unit}
        </span>
        <span className="text-xs text-zinc-400">{formatShortDate(data[0].label)}</span>
      </div>
    )
  }

  const padding = { top: 20, right: 16, bottom: 32, left: 40 }
  const width = 320
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1
  const buffer = range * 0.1
  const yMin = Math.max(0, minVal - buffer)
  const yMax = maxVal + buffer

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((d.value - yMin) / (yMax - yMin)) * chartH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  // Find the PR point (highest value)
  const prIndex = values.indexOf(Math.max(...values))

  // Y-axis labels (3-4 values)
  const ySteps = 3
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = yMin + (i / ySteps) * (yMax - yMin)
    return Math.round(val)
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      {/* Area fill */}
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-accent)]" stopOpacity={0.2} />
          <stop offset="100%" className="[stop-color:var(--color-accent)]" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGradient)" />

      {/* Y-axis labels */}
      {yLabels.map((val, i) => {
        const y = padding.top + chartH - (i / ySteps) * chartH
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-zinc-400 dark:fill-zinc-600 text-[9px]"
            >
              {val}
            </text>
          </g>
        )
      })}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        className="stroke-accent dark:stroke-accent-dark"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={i === prIndex ? 5 : 3}
            className={
              i === prIndex
                ? 'fill-accent dark:fill-accent-dark'
                : 'fill-white dark:fill-zinc-900 stroke-accent dark:stroke-accent-dark'
            }
            strokeWidth={i === prIndex ? 0 : 1.5}
          />
          {/* X-axis label — show first, last, and PR */}
          {(i === 0 || i === data.length - 1 || i === prIndex) && (
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-zinc-400 dark:fill-zinc-600 text-[8px]"
            >
              {formatShortDate(p.label)}
            </text>
          )}
        </g>
      ))}

      {/* PR label */}
      {prIndex >= 0 && (
        <text
          x={points[prIndex].x}
          y={points[prIndex].y - 10}
          textAnchor="middle"
          className="fill-accent dark:fill-accent-dark text-[10px] font-bold"
        >
          PR {points[prIndex].value}{unit}
        </text>
      )}
    </svg>
  )
}
