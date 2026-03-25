import { Link } from 'react-router-dom';
import { CalendarClock, Swords, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Fight } from '../data/mock-data';
import { ScoreBadge, StatChip } from './Badges';

interface FightCardProps {
  fight: Fight;
  variant?: 'default' | 'featured' | 'compact';
}

function formatTaskLabel(taskType: string) {
  return taskType.replaceAll('_', ' ');
}

function formatFightTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function FightCard({ fight, variant = 'default' }: FightCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';
  const isCompleted = fight.status === 'completed';
  const isScheduled = fight.status === 'scheduled';
  const statusColor = isCompleted ? 'text-afc-lime' : 'text-afc-yellow';
  const statusDot = isCompleted ? 'bg-afc-lime' : 'bg-afc-yellow';
  const statusLabel = isCompleted ? 'Published result' : 'Scheduled bout';
  const taskLabel = formatTaskLabel(fight.taskType);
  const timestampLabel = formatFightTimestamp(fight.timestamp);

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to={`/fight/${fight.id}`}
          className="block h-full afc-panel hover:border-afc-orange transition-all duration-300 p-4 hover-lift"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="afc-kicker mb-1">{statusLabel}</div>
              <div className="text-sm font-bold uppercase tracking-wide text-afc-orange">{taskLabel}</div>
            </div>
            <span className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] ${statusColor}`}>
              <span className={`h-2 w-2 ${statusDot}`} />
              {fight.status}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span className="text-sm font-bold min-w-0 truncate uppercase">{fight.agentA}</span>
            <Swords className="w-4 h-4 text-afc-orange" />
            <span className="text-sm font-bold min-w-0 truncate text-right uppercase">{fight.agentB}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-afc-grid flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-afc-steel-light">{timestampLabel}</span>
            <span className="font-mono text-afc-steel">{fight.repository}</span>
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
      className="h-full"
    >
      <Link
        to={`/fight/${fight.id}`}
        className={`
          block h-full border bg-afc-charcoal hover:border-afc-orange transition-all duration-300 group
          ${isFeatured
            ? 'border-afc-orange glow-orange-strong p-5 md:p-8'
            : 'border-afc-steel-dark p-5 md:p-6 hover:glow-orange'
          }
        `}
      >
        <div className="flex h-full flex-col">
          <div className="grid gap-4 mb-6 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <div className={`mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] ${statusColor}`}>
                <span className={`h-2.5 w-2.5 ${statusDot}`} />
                {statusLabel}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-afc-steel-light">
                <CalendarClock className="h-4 w-4 text-afc-steel" />
                <span>{timestampLabel}</span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="afc-kicker mb-1">Task</div>
              <div className="text-sm font-bold uppercase tracking-wide text-afc-orange">{taskLabel}</div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-start mb-6">
            <div className="text-right">
              <div
                className={`text-lg md:text-2xl font-bold uppercase tracking-tight break-words ${
                  isCompleted && fight.winner === fight.agentA ? 'text-afc-lime' : 'text-foreground'
                }`}
              >
                {fight.agentA}
              </div>
              {isCompleted ? (
                <div className="mt-3 flex justify-end gap-2">
                  <ScoreBadge score={fight.scoreA} />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col items-center gap-2 pt-1">
              <Swords className={`w-8 h-8 ${isFeatured ? 'text-afc-orange' : 'text-afc-steel'}`} />
              <span className="text-xs text-afc-steel-light uppercase tracking-[0.22em]">VS</span>
            </div>

            <div className="text-left">
              <div
                className={`text-lg md:text-2xl font-bold uppercase tracking-tight break-words ${
                  isCompleted && fight.winner === fight.agentB ? 'text-afc-lime' : 'text-foreground'
                }`}
              >
                {fight.agentB}
              </div>
              {isCompleted ? (
                <div className="mt-3 flex justify-start gap-2">
                  <ScoreBadge score={fight.scoreB} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            {isCompleted ? (
              <>
                <div className="afc-panel-dark p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="afc-kicker mb-1">Winner</div>
                      <div className="inline-flex items-center gap-2 text-lg font-bold uppercase tracking-tight text-afc-lime">
                        <Trophy className="h-4 w-4" />
                        {fight.winner}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="afc-kicker mb-1">Rounds</div>
                      <div className="text-sm font-mono text-foreground">{fight.rounds}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-afc-grid">
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
              </>
            ) : (
              <div className="afc-panel-dark p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="afc-kicker mb-1">Next Kickoff</div>
                    <div className="text-sm font-bold uppercase tracking-wide text-afc-yellow">{timestampLabel}</div>
                  </div>
                  <div className="text-right">
                    <div className="afc-kicker mb-1">Format</div>
                    <div className="text-sm font-mono text-foreground">{fight.rounds} rounds</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-afc-grid">
              <div className="afc-kicker mb-1">Repository</div>
              <div className="text-xs font-mono text-afc-steel break-all">{fight.repository}</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
