import { useEffect, useState } from 'react';

interface GPAIconProps {
  power: number;
}

const GPAIcon = ({ power }: GPAIconProps) => {
  const [smokeParticles, setSmokeParticles] = useState<number[]>([]);

  useEffect(() => {
    setSmokeParticles(Array.from({ length: 8 }, (_, i) => i));
  }, []);

  const getSmokeIntensity = () => {
    return Math.min(power / 1200, 1);
  };

  const getSmokeColor = () => {
    if (power < 500) return '#64748b';
    if (power > 1000) return '#ef4444';
    return '#10b981';
  };

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
      >
        <defs>
          <linearGradient id="engineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          
          <filter id="smokeBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        <rect
          x="60"
          y="80"
          width="80"
          height="60"
          rx="4"
          fill="url(#engineGradient)"
          stroke="#475569"
          strokeWidth="2"
        />

        <rect
          x="70"
          y="90"
          width="20"
          height="40"
          rx="2"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
        />
        <rect
          x="110"
          y="90"
          width="20"
          height="40"
          rx="2"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
        />

        <rect
          x="80"
          y="60"
          width="40"
          height="25"
          rx="3"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="2"
        />

        <circle cx="100" cy="72" r="3" fill={getSmokeColor()} className="animate-pulse" />

        {smokeParticles.map((_, i) => {
          const delay = i * 0.3;
          const offset = (i % 2) * 10 - 5;
          
          return (
            <circle
              key={i}
              cx={100 + offset}
              cy={60}
              r={4 + i * 0.5}
              fill={getSmokeColor()}
              opacity={getSmokeIntensity() * (1 - i * 0.12)}
              filter="url(#smokeBlur)"
              style={{
                animation: `smokeRise ${2 + i * 0.2}s ease-out ${delay}s infinite`,
              }}
            />
          );
        })}

        <rect
          x="55"
          y="140"
          width="90"
          height="15"
          rx="2"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="2"
        />

        <rect
          x="145"
          y="100"
          width="25"
          height="8"
          rx="2"
          fill="#475569"
          stroke="#64748b"
          strokeWidth="1"
        />
        <rect
          x="30"
          y="100"
          width="25"
          height="8"
          rx="2"
          fill="#475569"
          stroke="#64748b"
          strokeWidth="1"
        />
      </svg>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card border-2 border-primary rounded-lg px-4 py-2 shadow-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{power.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">кВт</p>
        </div>
      </div>

      <style>{`
        @keyframes smokeRise {
          0% {
            transform: translateY(0) scale(1);
            opacity: ${getSmokeIntensity()};
          }
          100% {
            transform: translateY(-80px) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GPAIcon;
