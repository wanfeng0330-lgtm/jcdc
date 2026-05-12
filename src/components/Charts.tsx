'use client';

import { motion } from 'framer-motion';

interface RiskGaugeProps {
  value: number;
  size?: number;
  label?: string;
}

export function RiskGauge({ value, size = 160, label }: RiskGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color = value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#22c55e';

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(100, 100, 255, 0.1)"
          strokeWidth="6"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {value}%
        </motion.span>
        {label && <span className="text-xs text-muted mt-1">{label}</span>}
      </div>
    </div>
  );
}

interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
}

export function RadarChart({ data, size = 200 }: RadarChartProps) {
  const center = size / 2;
  const maxRadius = (size - 40) / 2;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={data
              .map((_, i) => {
                const p = getPoint(i, level * 100);
                return `${p.x},${p.y}`;
              })
              .join(' ')}
            fill="none"
            stroke="rgba(100, 100, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(100, 100, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          points={data.map((d, i) => getPoint(i, d.value)).map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(99, 102, 241, 0.15)"
          stroke="#6366f1"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const p = getPoint(i, d.value);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#6366f1"
              initial={{ r: 0 }}
              animate={{ r: 4 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const p = getPoint(i, 120);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted text-[10px]"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

interface RiskHeatMapProps {
  data: { label: string; value: number }[];
}

export function RiskHeatMap({ data }: RiskHeatMapProps) {
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-1"
        >
          <div className="flex justify-between text-xs">
            <span className="text-foreground/70">{item.label}</span>
            <span className={item.value >= 70 ? 'text-danger' : item.value >= 40 ? 'text-warning' : 'text-success'}>
              {item.value}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: item.value >= 70
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : item.value >= 40
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                  : 'linear-gradient(90deg, #22c55e, #16a34a)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
