import { Link } from 'react-router-dom';
import { Swords, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Fight } from '../data/mock-data';
import { ScoreBadge } from './Badges';

interface FightCardProps {
  fight: Fight;
  variant?: 'default' | 'featured' | 'compact';
}

function formatTaskLabel(taskType: string) {
  return taskType.replaceAll('_', ' ');
}

export function FightCard({ fight, variant = 'default' }: FightCardProps) {
  const isCompleted = fight.status === 'completed';
  const isFeatured = variant === 'featured';
  const taskLabel = formatTaskLabel(fight.taskType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={`/fight/${fight.id}`}
        className={`
          block h-full border bg-afc-charcoal hover:border-afc-orange transition-all duration-200 group p-5
          ${isFeatured ? 'border-afc-orange' : 'border-afc-steel-dark'}
        `}
      >
        {/* Task label */}
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-afc-orange">{taskLabel}</span>
        </div>

        {/* Matchup */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
          <div className="text-right">
            <div
              className={`text-base font-bold uppercase tracking-tight ${
                isCompleted && fight.winner === fight.agentA ? 'text-afc-lime' : 'text-foreground'
              }`}
            >
              {fight.agentA}
            </div>
            {isCompleted && (
              <div className="mt-2 flex justify-end">
                <ScoreBadge score={fight.scoreA} />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <Swords className="w-5 h-5 text-afc-steel" />
            <span className="text-[10px] text-afc-steel-light uppercase tracking-widest">vs</span>
          </div>

          <div className="text-left">
            <div
              className={`text-base font-bold uppercase tracking-tight ${
                isCompleted && fight.winner === fight.agentB ? 'text-afc-lime' : 'text-foreground'
              }`}
            >
              {fight.agentB}
            </div>
            {isCompleted && (
              <div className="mt-2 flex justify-start">
                <ScoreBadge score={fight.scoreB} />
              </div>
            )}
          </div>
        </div>

        {/* Winner */}
        {isCompleted && fight.winner && (
          <div className="pt-3 border-t border-afc-grid flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-afc-lime" />
            <span className="text-sm font-bold uppercase tracking-tight text-afc-lime">{fight.winner}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
