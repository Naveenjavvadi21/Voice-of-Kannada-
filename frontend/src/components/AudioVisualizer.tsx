import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
  label?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  color = '#9B111E',
  label = 'Listening...'
}) => {
  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center py-2 animate-fade-in">
      <div className="flex items-center space-x-1 h-8">
        {[0.1, 0.3, 0.5, 0.2, 0.6, 0.4, 0.7, 0.3, 0.1].map((delay, idx) => (
          <span
            key={idx}
            className="w-1.5 rounded-full bg-current animate-wave-bar"
            style={{
              color: color,
              animationDelay: `${delay}s`,
              height: `${12 + (idx % 3) * 8}px`
            }}
          />
        ))}
      </div>
      {label && (
        <span className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};
