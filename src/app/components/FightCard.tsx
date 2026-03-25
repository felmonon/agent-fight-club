import { Link } from 'react-router-dom';
import { Swords, Clock, DollarSign, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Fight } from '../data/mock-data';
import { ScoreBadge, StatChip } from './Badges';

interface FightCardProps {
  fight: Fight;
  variant?: 'default' | 'featured' | 'compact';
}

export function FightCard({ fight, variant = 'default' }: FightCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';
  const isCompleted = fight.status === 'completed';
  const isLive = fight.status === 'live';
  
  const statusColor = isLive 
    ? 'text-afc-red' 
    : isCompleted 
    ? 'text-afc-lime' 
    : 'text-afc-steel';
  
  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link 
          to={`/fight/${fight.id}`}
          className="block border border-afc-steel-dark bg-afc-charcoal hover:border-afc-orange transition-all duration-300 p-4 hover-lift"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs uppercase tracking-wider font-bold ${statusColor}`}>
              {fight.status}
            </span>
            <span className="text-[10px] text-afc-steel-light uppercase">{fight.taskType.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{fight.agentA}</span>
            <Swords className="w-4 h-4 text-afc-orange" />
            <span className="text-sm font-bold">{fight.agentB}</span>
          </div>
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to={`/fight/${fight.id}`}
        className={`
          block border bg-afc-charcoal hover:border-afc-orange transition-all duration-300 group
          ${isFeatured 
            ? 'border-afc-orange glow-orange-strong p-8' 
            : 'border-afc-steel-dark p-6 hover:glow-orange'
          }
          ${isLive ? 'glow-red' : ''}
        `}
      >
        {/* Status Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 ${isLive ? 'bg-afc-red animate-pulse' : isCompleted ? 'bg-afc-lime' : 'bg-afc-steel'}`} />
            <span className={`text-xs uppercase tracking-widest font-bold ${statusColor}`}>
              {fight.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-afc-steel-light uppercase tracking-wider">Task</div>
            <div className="text-sm font-bold text-afc-orange">{fight.taskType.replace('_', ' ')}</div>
          </div>
        </div>
        
        {/* Fighter Comparison */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center mb-6">
          {/* Fighter A */}
          <div className="text-right">
            <div className={`text-2xl font-bold uppercase tracking-tight mb-2 ${isCompleted && fight.winner === fight.agentA ? 'text-afc-lime' : 'text-foreground'}`}>
              {fight.agentA}
            </div>
            {isCompleted && (
              <div className="flex justify-end gap-2">
                <ScoreBadge score={fight.scoreA} />
              </div>
            )}
          </div>
          
          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <Swords className={`w-8 h-8 ${isFeatured ? 'text-afc-orange' : 'text-afc-steel'}`} />
            <span className="text-xs text-afc-steel-light uppercase tracking-widest">VS</span>
          </div>
          
          {/* Fighter B */}
          <div className="text-left">
            <div className={`text-2xl font-bold uppercase tracking-tight mb-2 ${isCompleted && fight.winner === fight.agentB ? 'text-afc-lime' : 'text-foreground'}`}>
              {fight.agentB}
            </div>
            {isCompleted && (
              <div className="flex justify-start gap-2">
                <ScoreBadge score={fight.scoreB} />
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        {isCompleted && (
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-afc-grid">
            <StatChip 
              label="Budget A" 
              value={`$${fight.budgetUsedA}`}
              variant={fight.budgetUsedA < fight.budgetUsedB ? 'lime' : 'default'}
            />
            <StatChip 
              label="Budget B" 
              value={`$${fight.budgetUsedB}`}
              variant={fight.budgetUsedB < fight.budgetUsedA ? 'lime' : 'default'}
            />
            <StatChip 
              label="Runtime A" 
              value={`${fight.runtimeA}s`}
              variant={fight.runtimeA < fight.runtimeB ? 'lime' : 'default'}
            />
            <StatChip 
              label="Runtime B" 
              value={`${fight.runtimeB}s`}
              variant={fight.runtimeB < fight.runtimeA ? 'lime' : 'default'}
            />
          </div>
        )}
        
        {/* Repository */}
        <div className="mt-4 pt-4 border-t border-afc-grid">
          <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Repository</div>
          <div className="text-xs font-mono text-afc-steel">{fight.repository}</div>
        </div>
      </Link>
    </motion.div>
  );
}