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
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PowerData {
  timestamp: number;
  power: number;
}

interface ShutdownLog {
  id: number;
  startTime: Date;
  endTime: Date;
  duration: number;
}

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

const Index = () => {
  const [powerData, setPowerData] = useState<PowerData[]>([]);
  const [currentPower, setCurrentPower] = useState(0);
  const [maxPower, setMaxPower] = useState(0);
  const [avgPower, setAvgPower] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [allShutdownLogs] = useState<ShutdownLog[]>([
    {
      id: 1,
      startTime: new Date('2026-01-06T08:15:00'),
      endTime: new Date('2026-01-06T09:45:00'),
      duration: 90
    },
    {
      id: 2,
      startTime: new Date('2026-01-05T14:30:00'),
      endTime: new Date('2026-01-05T15:10:00'),
      duration: 40
    },
    {
      id: 3,
      startTime: new Date('2026-01-04T22:00:00'),
      endTime: new Date('2026-01-05T06:00:00'),
      duration: 480
    },
    {
      id: 4,
      startTime: new Date('2026-01-03T11:20:00'),
      endTime: new Date('2026-01-03T11:35:00'),
      duration: 15
    },
    {
      id: 5,
      startTime: new Date('2026-01-02T16:45:00'),
      endTime: new Date('2026-01-02T18:30:00'),
      duration: 105
    },
    {
      id: 6,
      startTime: new Date('2026-01-01T10:00:00'),
      endTime: new Date('2026-01-01T11:20:00'),
      duration: 80
    },
    {
      id: 7,
      startTime: new Date('2025-12-30T15:30:00'),
      endTime: new Date('2025-12-30T16:00:00'),
      duration: 30
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

  const filteredLogs = allShutdownLogs.filter((log) => {
    if (!dateRange.from && !dateRange.to) return true;
    
    const logDate = new Date(log.startTime);
    logDate.setHours(0, 0, 0, 0);
    
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return logDate >= from && logDate <= to;
    }
    
    if (dateRange.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      return logDate >= from;
    }
    
    return true;
  });

  const resetFilter = () => {
    setDateRange({ from: undefined, to: undefined });
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

          <div className="flex items-center gap-3 mt-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <Icon name="Calendar" className="mr-2" size={16} />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd.MM.yyyy', { locale: ru })} - {format(dateRange.to, 'dd.MM.yyyy', { locale: ru })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd.MM.yyyy', { locale: ru })
                    )
                  ) : (
                    <span>Выбрать период</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  locale={ru}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {(dateRange.from || dateRange.to) && (
              <Button variant="ghost" onClick={resetFilter} size="sm">
                <Icon name="X" className="mr-1" size={16} />
                Сбросить
              </Button>
            )}
            
            <div className="ml-auto text-sm text-muted-foreground">
              Найдено: <span className="font-bold text-foreground">{filteredLogs.length}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Search" className="mx-auto mb-2" size={32} />
                <p>Остановок за выбранный период не найдено</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
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
                    </div>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>
          
          {filteredLogs.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="BarChart3" className="text-primary" size={20} />
                  <span className="text-muted-foreground">Всего остановок:</span>
                  <span className="font-bold text-foreground">{filteredLogs.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Timer" className="text-secondary" size={20} />
                  <span className="text-muted-foreground">Общий простой:</span>
                  <span className="font-bold text-foreground">
                    {formatDuration(filteredLogs.reduce((sum, log) => sum + log.duration, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;