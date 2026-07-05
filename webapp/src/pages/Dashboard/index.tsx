import { motion } from 'motion/react';
import { Widget } from '@components/widget';
import { KPI } from '@components/kpi';
import { AreaChart } from '@components/area-chart';
import { BarChart } from '@components/bar-chart';
import { ChartTooltip } from '@components/chart-tooltip';
import { staggerContainer, fadeInScale } from '../../shared/lib/animations';
import { useQuery } from '../../shared/hooks/use-api';
import { useEffect, useState } from 'react';
import { api } from '../../shared/lib/api';
import { Skeleton } from '@heroui/react';
import { Sun, Droplet, Camera, Person } from '@gravity-ui/icons';

interface DashboardData {
  sensors: { temperature: number | null; humidity: number | null };
  cameras: { total: number; online: number };
  family: { total: number; home: number };
  devices: { total: number; online: number };
}

interface SensorRecord {
  deviceId: string;
  type: string;
  value: number;
  timestamp: string;
}

export function DashboardPage() {
  const { data: dashboard, loading } = useQuery<DashboardData>('/dashboard');
  const [sensorHistory, setSensorHistory] = useState<{ time: string; temperature: number; humidity: number }[]>([]);

  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    api.get<{ success: boolean; data: SensorRecord[] }>(`/sensors?deviceId=esp32-001&from=${from}&limit=200`)
      .then((res) => {
        const grouped = new Map<string, { temperature?: number; humidity?: number }>();
        for (const r of res.data) {
          const hour = new Date(r.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
          if (!grouped.has(hour)) grouped.set(hour, {});
          const g = grouped.get(hour)!;
          if (r.type === 'temperature') g.temperature = Math.round(r.value * 10) / 10;
          if (r.type === 'humidity') g.humidity = Math.round(r.value * 10) / 10;
        }
        const arr = Array.from(grouped.entries())
          .map(([time, v]) => ({ time, temperature: v.temperature || 0, humidity: v.humidity || 0 }))
          .reverse()
          .slice(-24);
        setSensorHistory(arr);
      })
      .catch(() => {});
  }, []);

  const kpiCards = [
    { title: '温度', value: dashboard?.sensors.temperature ?? '--', unit: '°C', trend: 'neutral' as const, change: '', Icon: Sun },
    { title: '湿度', value: dashboard?.sensors.humidity ?? '--', unit: '%', trend: 'neutral' as const, change: '', Icon: Droplet },
    { title: '在线摄像头', value: `${dashboard?.cameras.online ?? 0}/${dashboard?.cameras.total ?? 0}`, unit: '', trend: 'up' as const, change: '', Icon: Camera },
    { title: '在家成员', value: `${dashboard?.family.home ?? 0}/${dashboard?.family.total ?? 0}`, unit: '', trend: 'up' as const, change: '', Icon: Person },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Header>
                <Skeleton className="h-4 w-16 rounded" />
              </Widget.Header>
              <Widget.Content>
                <Skeleton className="h-8 w-24 rounded" />
              </Widget.Content>
            </Widget>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Widget>
            <Widget.Header>
              <Widget.Title>
                <Skeleton className="h-4 w-32 rounded" />
              </Widget.Title>
            </Widget.Header>
            <Widget.Content>
              <Skeleton className="h-[220px] w-full rounded-lg" />
            </Widget.Content>
          </Widget>
          <Widget>
            <Widget.Header>
              <Widget.Title>
                <Skeleton className="h-4 w-24 rounded" />
              </Widget.Title>
            </Widget.Header>
            <Widget.Content>
              <Skeleton className="h-[220px] w-full rounded-lg" />
            </Widget.Content>
          </Widget>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
      >
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.95 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
              },
            }}
          >
            <KPI>
              <KPI.Header>
                <KPI.Title>
                  <span className="flex items-center gap-1.5">
                    <card.Icon className="size-4" />
                    {card.title}
                  </span>
                </KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value
                  style="decimal"
                  value={typeof card.value === 'number' ? card.value : 0}
                  maximumFractionDigits={1}
                />
                {typeof card.value === 'string' && (
                  <span className="text-2xl font-semibold">{card.value}</span>
                )}
                {card.unit && <span className="text-sm text-neutral-500 ml-1">{card.unit}</span>}
              </KPI.Content>
            </KPI>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={fadeInScale}>
        <Widget>
          <Widget.Header>
            <Widget.Title>24h 温湿度趋势</Widget.Title>
            <Widget.Legend>
              <Widget.LegendItem color="var(--chart-1)">温度</Widget.LegendItem>
              <Widget.LegendItem color="var(--chart-4)">湿度</Widget.LegendItem>
            </Widget.Legend>
          </Widget.Header>
          <Widget.Content>
            <AreaChart data={sensorHistory} height={220}>
              <AreaChart.Grid vertical={false} />
              <AreaChart.XAxis dataKey="time" tickMargin={8} />
              <AreaChart.YAxis width={40} />
              <AreaChart.Area
                dataKey="temperature"
                name="温度"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.15}
                type="monotone"
              />
              <AreaChart.Area
                dataKey="humidity"
                name="湿度"
                stroke="var(--chart-4)"
                fill="var(--chart-4)"
                fillOpacity={0.1}
                type="monotone"
              />
              <AreaChart.Tooltip
                content={({ active, label, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltip>
                      <ChartTooltip.Header>{label}</ChartTooltip.Header>
                      {payload.map((entry) => (
                        <ChartTooltip.Item key={String(entry.dataKey)}>
                          <ChartTooltip.Indicator color={entry.color ?? entry.stroke} />
                          <ChartTooltip.Label>{entry.name}</ChartTooltip.Label>
                          <ChartTooltip.Value>{Number(entry.value).toFixed(1)}</ChartTooltip.Value>
                        </ChartTooltip.Item>
                      ))}
                    </ChartTooltip>
                  );
                }}
              />
            </AreaChart>
          </Widget.Content>
        </Widget>

        <Widget>
          <Widget.Header>
            <Widget.Title>设备概览</Widget.Title>
          </Widget.Header>
          <Widget.Content>
            <BarChart
              data={[
                { name: '摄像头', online: dashboard?.cameras.online ?? 0, total: dashboard?.cameras.total ?? 0 },
                { name: '传感器', online: dashboard?.devices.online ?? 0, total: dashboard?.devices.total ?? 0 },
              ]}
              height={220}
            >
              <BarChart.Grid vertical={false} />
              <BarChart.XAxis dataKey="name" />
              <BarChart.YAxis width={30} />
              <BarChart.Bar dataKey="online" name="在线" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <BarChart.Bar dataKey="total" name="总计" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </Widget.Content>
        </Widget>
      </motion.div>
    </motion.div>
  );
}
