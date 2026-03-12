'use client';

import { SafetyBand } from '@/types/sentinel';
import { cn } from '@/lib/utils';

interface SafetyScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SafetyScoreBadge({ score, size = 'md' }: SafetyScoreBadgeProps) {
  let band: SafetyBand = 'danger';
  let colorClass = 'text-red-500';
  let bgClass = 'bg-red-500/10';
  
  if (score >= 70) {
    band = 'safe';
    colorClass = 'text-green-500';
    bgClass = 'bg-green-500/10';
  } else if (score >= 40) {
    band = 'caution';
    colorClass = 'text-amber-500';
    bgClass = 'bg-amber-500/10';
  }

  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl',
  };

  // Calculate stroke for circular progress
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center rounded-full", sizeClasses[size], bgClass)} 
         role="img" 
         aria-label={`Safety Score ${score} out of 100, ${band} rating`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", colorClass)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-bold", colorClass)}>{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</span>
      </div>
    </div>
  );
}