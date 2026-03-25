import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { CountUp } from './CountUp';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  color?: 'orange' | 'lime' | 'yellow' | 'red' | 'green' | 'default';
  trend?: 'up' | 'down' | 'stable';
  animated?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'default',
  trend,
  animated = true,
  decimals = 0,
  prefix = '',
  suffix = '',
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    orange: 'text-afc-orange',
    lime: 'text-afc-lime',
    yellow: 'text-afc-yellow',
    red: 'text-afc-red',
    green: 'text-afc-green',
    default: 'text-foreground',
  };

  const iconColorClasses = {
    orange: 'text-afc-orange',
    lime: 'text-afc-lime',
    yellow: 'text-afc-yellow',
    red: 'text-afc-red',
    green: 'text-afc-green',
    default: 'text-afc-steel',
  };

  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full border border-afc-steel-dark bg-afc-black p-4 hover:border-afc-steel transition-all duration-300 group"
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />}
        <span className="text-[10px] text-afc-steel-light uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color]} group-hover:scale-105 transition-transform`}>
        {animated && typeof value === 'number' ? (
          <CountUp value={numericValue} decimals={decimals} prefix={prefix} suffix={suffix} />
        ) : (
          <>
            {prefix}
            {value}
            {suffix}
          </>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          {trend === 'up' && (
            <span className="text-xs text-afc-green">↑ Trending</span>
          )}
          {trend === 'down' && (
            <span className="text-xs text-afc-red">↓ Declining</span>
          )}
          {trend === 'stable' && (
            <span className="text-xs text-afc-steel-light">→ Stable</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
