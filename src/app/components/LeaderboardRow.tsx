import { Link } from 'react-router-dom';
import { Agent } from '../data/mock-data';
import { TrendBadge, TagBadge } from './Badges';
import { Target, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface LeaderboardRowProps {
  agent: Agent;
  showDetails?: boolean;
}

export function LeaderboardRow({ agent, showDetails = false }: LeaderboardRowProps) {
  const winRate = ((agent.wins / (agent.wins + agent.losses)) * 100).toFixed(1);

  return (
    <Link
      to={`/agent/${agent.id}`}
      className="grid min-w-[1040px] grid-cols-[60px_1fr_120px_100px_100px_120px_100px_110px_120px] gap-4 items-center px-4 py-4 border-b border-afc-grid hover:bg-afc-charcoal-light transition-colors group"
    >
      {/* Rank */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <span className={`text-2xl font-bold font-mono ${agent.rank <= 3 ? 'text-afc-orange' : 'text-foreground'}`}>
            {agent.rank}
          </span>
          {agent.rankChange !== 0 && (
            <TrendBadge change={agent.rankChange} />
          )}
        </div>
      </div>

      {/* Agent Name & Tags */}
      <div>
        <div className="text-lg font-bold uppercase tracking-tight mb-1 group-hover:text-afc-orange transition-colors">
          {agent.modelName}
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] text-afc-steel-light font-mono">{agent.provider}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {agent.tags.slice(0, 2).map((tag, idx) => {
            const variant = tag.includes('CHAMPION')
              ? 'champion'
              : tag.includes('UPSET')
              ? 'upset'
              : tag.includes('EFFICIENT')
              ? 'efficient'
              : tag.includes('REVIEW')
              ? 'warning'
              : 'default';

            return <TagBadge key={idx} variant={variant}>{tag}</TagBadge>;
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="text-center">
        <div className="text-xl font-bold font-mono text-afc-lime">{agent.elo}</div>
      </div>

      {/* Record */}
      <div className="text-center">
        <div className="text-sm font-mono">
          <span className="text-afc-green font-bold">{agent.wins}</span>
          <span className="text-afc-steel mx-1">-</span>
          <span className="text-afc-red font-bold">{agent.losses}</span>
        </div>
        <div className="text-[10px] text-afc-steel">({winRate}%)</div>
      </div>

      {/* Win Streak */}
      <div className="text-center">
        <div className={`text-lg font-bold font-mono ${agent.winStreak > 5 ? 'text-afc-orange' : 'text-foreground'}`}>
          {agent.winStreak > 0 ? `${agent.winStreak}W` : 'L'}
        </div>
      </div>

      {/* Clean Wins */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Target className="w-3 h-3 text-afc-orange" />
          <span className="text-sm font-bold font-mono">{agent.finishes}</span>
        </div>
      </div>

      {/* Avg Cost */}
      <div className="text-center">
        <div className={`text-sm font-bold font-mono ${agent.avgCost < 0.5 ? 'text-afc-lime' : 'text-foreground'}`}>
          ${agent.avgCost}
        </div>
      </div>

      {/* Confidence */}
      <div className="text-center">
        <div className={`text-sm font-bold font-mono ${agent.confidence >= 80 ? 'text-afc-lime' : agent.confidence >= 65 ? 'text-afc-orange' : 'text-foreground'}`}>
          {agent.confidence}%
        </div>
        <div className="text-[10px] text-afc-steel">{agent.confidenceLabel}</div>
      </div>

      {/* Efficiency */}
      <div className="text-center">
        <div className={`text-sm font-bold font-mono ${agent.efficiency > 90 ? 'text-afc-lime' : 'text-foreground'}`}>
          {agent.efficiency}%
        </div>
      </div>
    </Link>
  );
}

interface LeaderboardHeaderProps {
  sortKey?: keyof Agent;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: keyof Agent) => void;
}

export function LeaderboardHeader({ sortKey, sortDirection, onSort }: LeaderboardHeaderProps) {
  const SortIcon = ({ field }: { field: keyof Agent }) => {
    if (sortKey !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 text-afc-orange" />
      : <ArrowDown className="w-3 h-3 text-afc-orange" />;
  };

  const HeaderCell = ({ field, label, className = '' }: { field: keyof Agent; label: string; className?: string }) => {
    const isActive = sortKey === field;
    return (
      <button
        onClick={() => onSort?.(field)}
        className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 group hover:text-afc-orange transition-colors ${
          isActive ? 'text-afc-orange' : 'text-afc-steel-light'
        } ${className}`}
      >
        {label}
        <SortIcon field={field} />
      </button>
    );
  };

  return (
    <div className="grid min-w-[1040px] grid-cols-[60px_1fr_120px_100px_100px_120px_100px_110px_120px] gap-4 items-center px-4 py-3 bg-afc-charcoal-light border-b border-afc-steel-dark">
      <HeaderCell field="rank" label="Rank" />
      <HeaderCell field="modelName" label="Model" />
      <HeaderCell field="elo" label="Rating" className="justify-center" />
      <HeaderCell field="wins" label="Record" className="justify-center" />
      <HeaderCell field="winStreak" label="Streak" className="justify-center" />
      <HeaderCell field="finishes" label="Clean Wins" className="justify-center" />
      <HeaderCell field="avgCost" label="Avg Cost" className="justify-center" />
      <HeaderCell field="confidence" label="Confidence" className="justify-center" />
      <HeaderCell field="efficiency" label="Efficiency" className="justify-center" />
    </div>
  );
}
