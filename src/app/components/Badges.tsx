import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface StatChipProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'lime';
  size?: 'sm' | 'md' | 'lg';
}

export function StatChip({ label, value, variant = 'default', size = 'md' }: StatChipProps) {
  const variantClasses = {
    default: 'bg-afc-steel-dark text-foreground',
    success: 'bg-afc-green/10 text-afc-green border border-afc-green/20',
    danger: 'bg-afc-red/10 text-afc-red border border-afc-red/20',
    warning: 'bg-afc-orange/10 text-afc-orange border border-afc-orange/20',
    lime: 'bg-afc-lime/10 text-afc-lime border border-afc-lime/20',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };
  
  return (
    <div className={`inline-flex flex-col ${sizeClasses[size]} ${variantClasses[variant]} font-mono`}>
      <span className="text-[9px] text-afc-steel-light uppercase tracking-wider">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

interface TrendBadgeProps {
  change: number;
  size?: 'sm' | 'md';
}

export function TrendBadge({ change, size = 'sm' }: TrendBadgeProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;
  const colorClass = isNeutral 
    ? 'text-afc-steel' 
    : isPositive 
    ? 'text-afc-green' 
    : 'text-afc-red';
  
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${colorClass} ${sizeClass}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(change)}
    </span>
  );
}

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glow';
}

export function ScoreBadge({ score, size = 'md', variant = 'default' }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-afc-lime';
    if (score >= 75) return 'text-afc-yellow';
    if (score >= 60) return 'text-afc-orange';
    return 'text-afc-red';
  };
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-lg px-3 py-1.5',
    lg: 'text-2xl px-4 py-2',
  };
  
  const glowClass = variant === 'glow' && score >= 90 
    ? 'shadow-[0_0_20px_rgba(212,255,0,0.3)]' 
    : '';
  
  return (
    <div className={`inline-flex items-center justify-center bg-afc-black border border-afc-steel-dark ${sizeClasses[size]} font-mono font-bold ${getScoreColor(score)} ${glowClass}`}>
      {score.toFixed(1)}
    </div>
  );
}

interface TagBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'champion' | 'upset' | 'efficient' | 'warning';
}

export function TagBadge({ children, variant = 'default' }: TagBadgeProps) {
  const variantClasses = {
    default: 'bg-afc-steel-dark text-afc-steel-light',
    champion: 'bg-afc-orange text-afc-black',
    upset: 'bg-afc-red/20 text-afc-red border border-afc-red',
    efficient: 'bg-afc-lime/20 text-afc-lime border border-afc-lime',
    warning: 'bg-afc-yellow/20 text-afc-yellow border border-afc-yellow',
  };
  
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  secondaryValue?: string;
  trend?: 'up' | 'down' | 'stable';
}

export function MetricRow({ label, value, secondaryValue, trend }: MetricRowProps) {
  const trendIcon = trend === 'up' 
    ? <ArrowUp className="w-3 h-3 text-afc-green" />
    : trend === 'down'
    ? <ArrowDown className="w-3 h-3 text-afc-red" />
    : <Minus className="w-3 h-3 text-afc-steel" />;
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-afc-grid">
      <span className="text-xs text-afc-steel-light uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {secondaryValue && (
          <span className="text-xs text-afc-steel">{secondaryValue}</span>
        )}
        <span className="text-sm font-bold text-foreground">{value}</span>
        {trend && trendIcon}
      </div>
    </div>
  );
}
