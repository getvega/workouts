import React from 'react';

interface CircularTimerProps {
  time: number;
  progress: number;
  size?: number;
  isExercise?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  time,
  progress,
  size = 200,
  isExercise = false,
}) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isExercise ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ffffff"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div
        className="absolute text-white font-bold"
        style={{ fontSize: size * 0.15 }}
      >
        {time}
      </div>
    </div>
  );
};