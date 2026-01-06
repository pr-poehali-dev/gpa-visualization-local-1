import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import GPAIcon from '@/components/GPAIcon';

interface PowerData {
  timestamp: number;
  power: number;
}

const Index = () => {
  const [powerData, setPowerData] = useState<PowerData[]>([]);
  const [currentPower, setCurrentPower] = useState(0);
  const [maxPower, setMaxPower] = useState(0);
  const [avgPower, setAvgPower] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const generatePowerValue = () => {
      const baseValue = 850;
      const variation = Math.random() * 200 - 100;
      return Math.max(0, Math.min(1200, baseValue + variation));
    };

    const interval = setInterval(() => {
      const newPower = generatePowerValue();
      const newTimestamp = Date.now();

      setPowerData((prev) => {
        const updated = [...prev, { timestamp: newTimestamp, power: newPower }];
        return updated.slice(-60);
      });

      setCurrentPower(newPower);

      if (newPower > maxPower) {
        setMaxPower(newPower);
      }

      if (powerData.length > 0) {
        const sum = powerData.reduce((acc, d) => acc + d.power, 0) + newPower;
        setAvgPower(sum / (powerData.length + 1));
      } else {
        setAvgPower(newPower);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [powerData, maxPower]);

  const getStatusColor = () => {
    if (currentPower < 500) return 'text-yellow-500';
    if (currentPower > 1000) return 'text-red-500';
    return 'text-secondary';
  };

  const getStatusText = () => {
    if (currentPower < 500) return 'Низкая нагрузка';
    if (currentPower > 1000) return 'Высокая нагрузка';
    return 'Норма';
  };

  const maxY = 1200;
  const chartHeight = 300;
  const chartWidth = 800;

  const getChartPath = () => {
    if (powerData.length < 2) return '';

    const points = powerData.map((d, i) => {
      const x = (i / (powerData.length - 1)) * chartWidth;
      const y = chartHeight - (d.power / maxY) * chartHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Мониторинг ГПА
            </h1>
            <p className="text-muted-foreground">
              Газо-поршневой агрегат • Режим реального времени
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-secondary animate-pulse' : 'bg-red-500'}`} />
            <Badge variant={isOnline ? 'default' : 'destructive'} className="bg-secondary text-foreground">
              {isOnline ? 'ОНЛАЙН' : 'ОФФЛАЙН'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="col-span-1 md:col-span-1 p-6 bg-card border-border flex items-center justify-center">
            <GPAIcon power={currentPower} />
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Текущая мощность
              </p>
              <Icon name="Zap" className="text-primary" size={20} />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {currentPower.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">кВт</p>
            <div className="mt-3">
              <Badge className={`${getStatusColor()} bg-muted border-0`}>
                {getStatusText()}
              </Badge>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-secondary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Пиковая мощность
              </p>
              <Icon name="TrendingUp" className="text-secondary" size={20} />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {maxPower.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">кВт</p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Средняя мощность
              </p>
              <Icon name="Activity" className="text-primary" size={20} />
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">
              {avgPower.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">кВт</p>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                График мощности
              </h2>
              <p className="text-sm text-muted-foreground">
                Последние 60 секунд
              </p>
            </div>
            <Icon name="LineChart" className="text-primary" size={24} />
          </div>

          <div className="relative w-full overflow-hidden rounded-lg bg-muted p-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {[0, 300, 600, 900, 1200].map((value) => (
                <g key={value}>
                  <line
                    x1={0}
                    y1={chartHeight - (value / maxY) * chartHeight}
                    x2={chartWidth}
                    y2={chartHeight - (value / maxY) * chartHeight}
                    stroke="rgb(100, 116, 139)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.2"
                  />
                  <text
                    x={-5}
                    y={chartHeight - (value / maxY) * chartHeight + 4}
                    fill="rgb(148, 163, 184)"
                    fontSize="12"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              ))}

              {powerData.length > 1 && (
                <>
                  <path
                    d={`${getChartPath()} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                    fill="url(#powerGradient)"
                  />
                  <path
                    d={getChartPath()}
                    stroke="rgb(14, 165, 233)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {powerData.length > 0 && (
                <circle
                  cx={((powerData.length - 1) / (powerData.length - 1)) * chartWidth}
                  cy={chartHeight - (currentPower / maxY) * chartHeight}
                  r="6"
                  fill="rgb(16, 185, 129)"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Мощность (кВт)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span>Текущее значение</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;