import { motion, AnimatePresence } from 'motion/react';
import { Widget } from '@components/widget';
import { KPI } from '@components/kpi';
import { AreaChart } from '@components/area-chart';
import { PieChart } from '@components/pie-chart';
import { ChartTooltip } from '@components/chart-tooltip';
import { staggerContainer } from '../../shared/lib/animations';
import { ListBox, Label, Description, Skeleton } from '@heroui/react';
import { useQuery } from '../../shared/hooks/use-api';

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};
import { HeartPulse, FaceSmile, Sun, Thunderbolt, Person } from '@gravity-ui/icons';
import { useMemo, useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────

interface FamilyMemberItem {
  _id: string;
  name: string;
  gender: string;
  avatar?: string;
  birthday?: string;
  isHome: boolean;
  healthStatus?: { overall: 'good' | 'warning' | 'alert'; notes?: string };
  emotionRecords?: { emotion: string; timestamp: string; context?: string }[];
}

interface EmotionData {
  kpi: { healthIndex: number; emotionScore: number; stressIndex: number; sleepQuality: number };
  emotionTrend: Array<{ day: string; 开心: number; 平静: number; 焦虑: number }>;
  emotionDistribution: Array<{ name: string; value: number; fill: string }>;
  healthTips: Array<{ title: string; content: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────

function calcAge(birthday?: string): number | null {
  if (!birthday) return null;
  const b = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function getEmoji(gender: string, birthday?: string): string {
  const age = calcAge(birthday);
  if (gender === 'female') {
    if (age !== null) {
      if (age < 6) return '👶';
      if (age < 14) return '👧';
      if (age < 60) return '👩';
      return '👵';
    }
    return '👩';
  }
  // male or other
  if (age !== null) {
    if (age < 6) return '👶';
    if (age < 14) return '👦';
    if (age < 60) return '👨';
    return '👴';
  }
  return '👨';
}

function getRole(gender: string, birthday?: string): string {
  const age = calcAge(birthday);
  if (age !== null) {
    if (age < 6) return '幼儿';
    if (age < 14) return '儿童';
    if (age < 18) return '青少年';
    if (age < 60) return '成年人';
    return '长辈';
  }
  return '家庭成员';
}

/** Seeded pseudo-random so the same member always gets the same data */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateEmotionData(member: FamilyMemberItem): EmotionData {
  const rand = seededRand(hashStr(member._id));
  const age = calcAge(member.birthday);
  const isChild = age !== null && age < 18;
  const isElderly = age !== null && age >= 60;

  // Base KPI values vary by age group
  let baseHealth = 80 + Math.floor(rand() * 15);
  let baseEmotion = 65 + Math.floor(rand() * 25);
  let baseStress = 15 + Math.floor(rand() * 30);
  let baseSleep = 6.5 + rand() * 3;

  if (isChild) {
    baseHealth = Math.min(baseHealth + 8, 99);
    baseEmotion = Math.min(baseEmotion + 10, 98);
    baseStress = Math.max(baseStress - 10, 5);
    baseSleep = Math.max(baseSleep + 1, 8);
  } else if (isElderly) {
    baseHealth = Math.max(baseHealth - 8, 60);
    baseStress = Math.max(baseStress - 5, 10);
    baseSleep = Math.max(baseSleep - 1, 5.5);
  }

  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const emotionTrend = days.map((day) => ({
    day,
    开心: 50 + Math.floor(rand() * 45),
    平静: 40 + Math.floor(rand() * 40),
    焦虑: 3 + Math.floor(rand() * 30),
  }));

  const happy = 25 + Math.floor(rand() * 25);
  const calm = 20 + Math.floor(rand() * 20);
  const focus = 10 + Math.floor(rand() * 18);
  const anxious = 3 + Math.floor(rand() * 12);
  const tired = Math.max(100 - happy - calm - focus - anxious, 2);

  const emotionDistribution = [
    { name: '开心', value: happy, fill: '#f59e0b' },
    { name: '平静', value: calm, fill: '#3b82f6' },
    { name: '专注', value: focus, fill: '#10b981' },
    { name: '焦虑', value: anxious, fill: '#ef4444' },
    { name: '疲劳', value: tired, fill: '#8b5cf6' },
  ];

  const allTips = isChild
    ? [
        { title: '📚 学习状态', content: `${member.name}本周专注力评分较高，建议保持"番茄钟"学习法，每25分钟休息5分钟。` },
        { title: '🎮 娱乐建议', content: '建议控制每天屏幕时间不超过1.5小时，多参加户外运动和社交活动。' },
        { title: '🥛 营养补充', content: '正处于生长发育期，建议每天摄入500ml牛奶和适量坚果，保证钙质和蛋白质。' },
      ]
    : isElderly
      ? [
          { title: '🌿 运动建议', content: `建议${member.name}每天进行15分钟轻度伸展运动，如太极拳或八段锦，有益关节灵活度。` },
          { title: '🧠 认知训练', content: '建议每天进行益智活动，如下棋、猜谜语或阅读，可有效延缓认知功能退化。' },
          { title: '☀️ 日照建议', content: '每天上午9-10点晒太阳20分钟，有助于维生素D合成和改善睡眠节律。' },
        ]
      : [
          { title: '🧘 正念冥想', content: `检测到${member.name}本周焦虑指数偏高，建议每天10分钟正念冥想，推荐在睡前进行。` },
          { title: '🏃 运动处方', content: '建议每天30分钟中等强度有氧运动，如快步走或骑行，可有效提升情绪评分。' },
          { title: '😴 睡眠优化', content: '建议睡前1小时减少蓝光暴露，保持卧室温度在22-24°C，有助深睡眠。' },
        ];

  return {
    kpi: {
      healthIndex: baseHealth,
      emotionScore: baseEmotion,
      stressIndex: baseStress,
      sleepQuality: Math.round(baseSleep * 10) / 10,
    },
    emotionTrend,
    emotionDistribution,
    healthTips: allTips,
  };
}

// ─── Emotion Nebula Component ──────────────────────────────────────

function EmotionNebula() {
  const particles = useMemo(() => {
    const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#fb923c'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="relative w-full h-[260px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-500 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-pink-500 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-blue-500 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -15, 5, -10, 0],
            x: [0, 8, -5, 3, 0],
            opacity: [0.4, 1, 0.6, 0.9, 0.4],
            scale: [1, 1.3, 0.9, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <motion.p
          className="text-lg font-medium opacity-80"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          情绪星云
        </motion.p>
        <p className="text-xs text-white/50 mt-1">实时情绪粒子可视化</p>
      </div>
    </div>
  );
}

// ─── Emotion Page ──────────────────────────────────────────────────

export function EmotionPage() {
  const { data: members, loading } = useQuery<FamilyMemberItem[]>('/family');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectionChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return;
    const first = [...keys][0];
    if (first) setSelectedId(String(first));
  }, []);

  // Auto-select first member when data loads
  const effectiveId = selectedId ?? members?.[0]?._id ?? null;
  const selectedMember = members?.find((m) => m._id === effectiveId) ?? null;

  const emoji = selectedMember ? getEmoji(selectedMember.gender, selectedMember.birthday) : '👤';
  const role = selectedMember ? getRole(selectedMember.gender, selectedMember.birthday) : '';

  const emotionData = useMemo(
    () => (selectedMember ? generateEmotionData(selectedMember) : null),
    [selectedMember],
  );

  const kpiCards = emotionData
    ? [
        { title: '心理健康指数', value: emotionData.kpi.healthIndex, unit: '/100', trend: 'up' as const, Icon: HeartPulse },
        { title: '今日情绪评分', value: emotionData.kpi.emotionScore, unit: '分', trend: 'neutral' as const, Icon: FaceSmile },
        { title: '压力指数', value: emotionData.kpi.stressIndex, unit: '%', trend: 'down' as const, Icon: Thunderbolt },
        { title: '睡眠质量', value: emotionData.kpi.sleepQuality, unit: 'h', trend: 'up' as const, Icon: Sun },
      ]
    : [];

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      {/* Family Member Selector */}
      <motion.div variants={fadeInScale}>
        <Widget>
          <Widget.Header>
            <Widget.Title>
              <span className="flex items-center gap-1.5">
                <Person className="size-4" />
                家庭成员
              </span>
            </Widget.Title>
          </Widget.Header>
          <Widget.Content>
            {loading && (
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-36 rounded-lg" />
                ))}
              </div>
            )}
            {!loading && members && members.length > 0 && (
              <ListBox
                aria-label="家庭成员"
                selectionMode="single"
                selectedKeys={effectiveId ? new Set([effectiveId]) : new Set()}
                onSelectionChange={handleSelectionChange}
                className="flex flex-row flex-wrap gap-2"
                orientation="horizontal"
              >
                {members.map((m) => {
                  const mEmoji = getEmoji(m.gender, m.birthday);
                  const mAge = calcAge(m.birthday);
                  const mData = generateEmotionData(m);
                  return (
                    <ListBox.Item key={m._id} id={m._id} textValue={m.name}>
                      <Label>
                        <span className="mr-1.5">{mEmoji}</span>
                        {m.name}
                        {mAge !== null && <span className="text-neutral-400 ml-1 text-xs">{mAge}岁</span>}
                      </Label>
                      <Description>健康指数 {mData.kpi.healthIndex}</Description>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  );
                })}
              </ListBox>
            )}
            {!loading && (!members || members.length === 0) && (
              <p className="text-sm text-neutral-400">暂无家庭成员，请先在「家庭」页面添加成员</p>
            )}
          </Widget.Content>
        </Widget>
      </motion.div>

      {selectedMember && emotionData && (
        <>
          {/* KPI Row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`kpi-${effectiveId}`}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {kpiCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
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
                        value={card.value}
                        maximumFractionDigits={1}
                      />
                      <span className="text-sm text-neutral-500 ml-1">{card.unit}</span>
                    </KPI.Content>
                  </KPI>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Charts Row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`charts-${effectiveId}`}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
            >
              {/* Area Chart */}
              <Widget>
                <Widget.Header>
                  <Widget.Title>{emoji} {selectedMember.name}的7日情绪趋势</Widget.Title>
                  <Widget.Legend>
                    <Widget.LegendItem color="var(--chart-1)">开心</Widget.LegendItem>
                    <Widget.LegendItem color="var(--chart-2)">平静</Widget.LegendItem>
                    <Widget.LegendItem color="var(--chart-4)">焦虑</Widget.LegendItem>
                  </Widget.Legend>
                </Widget.Header>
                <Widget.Content>
                  <AreaChart data={emotionData.emotionTrend} height={220}>
                    <AreaChart.Grid vertical={false} />
                    <AreaChart.XAxis dataKey="day" tickMargin={8} />
                    <AreaChart.YAxis width={40} domain={[0, 100]} />
                    <AreaChart.Area dataKey="开心" name="开心" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} type="monotone" />
                    <AreaChart.Area dataKey="平静" name="平静" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.1} type="monotone" />
                    <AreaChart.Area dataKey="焦虑" name="焦虑" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.1} type="monotone" />
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
                                <ChartTooltip.Value>{Number(entry.value)}</ChartTooltip.Value>
                              </ChartTooltip.Item>
                            ))}
                          </ChartTooltip>
                        );
                      }}
                    />
                  </AreaChart>
                </Widget.Content>
              </Widget>

              {/* Pie Chart */}
              <Widget>
                <Widget.Header>
                  <Widget.Title>{emoji} {selectedMember.name}的情绪分布</Widget.Title>
                </Widget.Header>
                <Widget.Content>
                  <PieChart height={220}>
                    <PieChart.Pie
                      data={emotionData.emotionDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {emotionData.emotionDistribution.map((entry) => (
                        <PieChart.Cell key={entry.name} fill={entry.fill} />
                      ))}
                      <PieChart.Label
                        content={() => (
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="text-2xl">
                            {emoji}
                          </text>
                        )}
                      />
                    </PieChart.Pie>
                    <PieChart.Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]!;
                        return (
                          <ChartTooltip>
                            <ChartTooltip.Item>
                              <ChartTooltip.Indicator color={String(d.payload?.fill ?? '')} />
                              <ChartTooltip.Label>{d.name ?? ''}</ChartTooltip.Label>
                              <ChartTooltip.Value>{d.value ?? 0}%</ChartTooltip.Value>
                            </ChartTooltip.Item>
                          </ChartTooltip>
                        );
                      }}
                    />
                  </PieChart>
                  <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-neutral-600">
                    {emotionData.emotionDistribution.map((item) => (
                      <span key={item.name} className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        {item.name} {item.value}%
                      </span>
                    ))}
                  </div>
                </Widget.Content>
              </Widget>
            </motion.div>
          </AnimatePresence>

          {/* Emotion Nebula */}
          <motion.div variants={fadeInScale}>
            <Widget>
              <Widget.Header>
                <Widget.Title>情绪星云</Widget.Title>
              </Widget.Header>
              <Widget.Content>
                <EmotionNebula />
              </Widget.Content>
            </Widget>
          </motion.div>

          {/* Health Tips */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tips-${effectiveId}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Widget>
                <Widget.Header>
                  <Widget.Title>AI 健康建议 · {emoji} {selectedMember.name}</Widget.Title>
                </Widget.Header>
                <Widget.Content>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {emotionData.healthTips.map((tip) => (
                      <motion.div
                        key={tip.title}
                        className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        whileHover={{ y: -2 }}
                      >
                        <h4 className="font-medium text-sm mb-2">{tip.title}</h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">{tip.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </Widget.Content>
              </Widget>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
