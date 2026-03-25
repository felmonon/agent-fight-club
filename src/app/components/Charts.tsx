import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EloHistoryChartProps {
  data: { date: string; elo: number; rank: number }[];
}

export function EloHistoryChart({ data }: EloHistoryChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-afc-steel-dark bg-afc-charcoal p-6"
    >
      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
        ELO History
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4FF00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D4FF00" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 106, 106, 0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#6A6A6A"
            style={{ fontSize: '10px', fill: '#8A8A8A' }}
          />
          <YAxis 
            stroke="#6A6A6A"
            style={{ fontSize: '10px', fill: '#8A8A8A' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #3A3A3A',
              borderRadius: '0',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#8A8A8A' }}
            itemStyle={{ color: '#D4FF00' }}
          />
          <Area
            type="monotone"
            dataKey="elo"
            stroke="#D4FF00"
            strokeWidth={2}
            fill="url(#eloGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

interface PerformanceRadarData {
  category: string;
  value: number;
}

export function PerformanceBreakdownChart({ data }: { data: PerformanceRadarData[] }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="border border-afc-steel-dark bg-afc-charcoal p-6"
    >
      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
        Performance Breakdown
      </div>
      
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-afc-steel-light uppercase tracking-wider">{item.category}</span>
              <span className="font-bold text-afc-lime">{item.value.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-afc-black relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-afc-orange via-afc-yellow to-afc-lime"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface WinRateChartProps {
  data: { date: string; winRate: number; wins: number; losses: number }[];
}

export function WinRateChart({ data }: WinRateChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="border border-afc-steel-dark bg-afc-charcoal p-6"
    >
      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
        Win Rate Trend
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 106, 106, 0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#6A6A6A"
            style={{ fontSize: '10px', fill: '#8A8A8A' }}
          />
          <YAxis 
            stroke="#6A6A6A"
            style={{ fontSize: '10px', fill: '#8A8A8A' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #3A3A3A',
              borderRadius: '0',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#8A8A8A' }}
          />
          <Line
            type="monotone"
            dataKey="winRate"
            stroke="#FF6B00"
            strokeWidth={2}
            dot={{ fill: '#FF6B00', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
