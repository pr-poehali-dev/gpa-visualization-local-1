import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import GPAIcon from '@/components/GPAIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PowerData {
  timestamp: number;
  power: number;
}

interface ShutdownLog {
  id: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  reason: string;
}

const Index = () => {
  const [powerData, setPowerData] = useState<PowerData[]>([]);
  const [currentPower, setCurrentPower] = useState(0);
  const [maxPower, setMaxPower] = useState(0);
  const [avgPower, setAvgPower] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [shutdownLogs] = useState<ShutdownLog[]>([
    {
      id: 1,
      startTime: new Date('2026-01-06T08:15:00'),
      endTime: new Date('2026-01-06T09:45:00'),
      duration: 90,
      reason: 'Плановое техническое обслуживание'
    },
    {
      id: 2,
      startTime: new Date('2026-01-05T14:30:00'),
      endTime: new Date('2026-01-05T15:10:00'),
      duration: 40,
      reason: 'Аварийная остановка - перегрев'
    },
    {
      id: 3,
      startTime: new Date('2026-01-04T22:00:00'),
      endTime: new Date('2026-01-05T06:00:00'),
      duration: 480,
      reason: 'Ночное обслуживание'
    },
    {
      id: 4,
      startTime: new Date('2026-01-03T11:20:00'),
      endTime: new Date('2026-01-03T11:35:00'),
      duration: 15,
      reason: 'Сброс параметров'
    },
    {
      id: 5,
      startTime: new Date('2026-01-02T16:45:00'),
      endTime: new Date('2026-01-02T18:30:00'),
      duration: 105,
      reason: 'Замена фильтров'
    }
  ]);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ч ${mins} мин`;
    }
    return `${mins} мин`;
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

        <div className="flex justify-center">
          <Card 
            className="w-64 p-6 bg-card border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => setShowLogDialog(true)}
          >
            <div className="scale-75">
              <GPAIcon power={currentPower} />
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Icon name="ClipboardList" className="text-primary" size={28} />
              Журнал остановок ГПА
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {shutdownLogs.map((log, index) => (
              <Card key={log.id} className="p-4 bg-muted border-border hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        Остановка #{shutdownLogs.length - index}
                      </Badge>
                      <Badge variant="outline" className="bg-muted-foreground/10">
                        {formatDuration(log.duration)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Clock" size={16} className="text-primary" />
                        <span className="font-medium">Начало:</span>
                        <span>{formatDate(log.startTime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="CheckCircle" size={16} className="text-secondary" />
                        <span className="font-medium">Запуск:</span>
                        <span>{formatDate(log.endTime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-foreground mt-3">
                        <Icon name="AlertCircle" size={16} className="text-yellow-500" />
                        <span className="font-medium">Причина:</span>
                        <span>{log.reason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon name="BarChart3" className="text-primary" size={20} />
                <span className="text-muted-foreground">Всего остановок:</span>
                <span className="font-bold text-foreground">{shutdownLogs.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Timer" className="text-secondary" size={20} />
                <span className="text-muted-foreground">Общий простой:</span>
                <span className="font-bold text-foreground">
                  {formatDuration(shutdownLogs.reduce((sum, log) => sum + log.duration, 0))}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;