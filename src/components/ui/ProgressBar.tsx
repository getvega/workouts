import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
}) => {
  return (
    <div className={`w-full bg-orange-600 h-2 ${className}`}>
      <div
        className="h-full bg-white transition-all duration-300"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};