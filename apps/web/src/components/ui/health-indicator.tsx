'use client';

import { cn } from '@/lib/cn';

export interface HealthIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 60) return { text: 'text-green-600 dark:text-green-400', stroke: 'stroke-green-500', bg: 'bg-green-500' };
  if (score >= 30) return { text: 'text-yellow-600 dark:text-yellow-400', stroke: 'stroke-yellow-500', bg: 'bg-yellow-500' };
  return { text: 'text-red-600 dark:text-red-400', stroke: 'stroke-red-500', bg: 'bg-red-500' };
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 30) return 'Fair';
  return 'Needs attention';
}

const sizeConfig = {
  sm: { dimension: 48, strokeWidth: 4, fontSize: 'text-xs' },
  md: { dimension: 64, strokeWidth: 5, fontSize: 'text-sm' },
  lg: { dimension: 88, strokeWidth: 6, fontSize: 'text-lg' },
} as const;

export function HealthIndicator({
  score,
  size = 'md',
  showLabel = true,
  label,
  className,
}: HealthIndicatorProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const colors = getScoreColor(clampedScore);
  const config = sizeConfig[size];

  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg
          className="-rotate-90"
          width={config.dimension}
          height={config.dimension}
          viewBox={`0 0 ${config.dimension} ${config.dimension}`}
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            className="stroke-warm-200 dark:stroke-warm-700"
            strokeWidth={config.strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            className={cn(colors.stroke, 'transition-all duration-500 ease-out')}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn('font-bold', colors.text, config.fontSize)}
            role="text"
            aria-label={`Health score: ${clampedScore} out of 100`}
          >
            {clampedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-warm-500 dark:text-warm-400">
          {label || getScoreLabel(clampedScore)}
        </span>
      )}
    </div>
  );
}
