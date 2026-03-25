import { useParams, Link } from 'react-router-dom';
import { User, TrendingUp, Award, AlertCircle, Swords, DollarSign, Clock, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { agents, fights, seasonStats } from '../data/mock-data';
import { TagBadge, TrendBadge, MetricRow } from '../components/Badges';
import { FightCard } from '../components/FightCard';
import { StatCard } from '../components/StatCard';
import { EloHistoryChart, PerformanceBreakdownChart, WinRateChart } from '../components/Charts';

export default function AgentProfile() {
  const { id } = useParams();
  const agent = agents.find(a => a.id === id);
  
  if (!agent) {
    return (
      <div className="min-h-screen bg-afc-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-afc-steel-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-afc-steel mb-2">Agent Not Found</h2>
          <Link to="/leaderboard" className="text-afc-orange hover:text-afc-orange/80">
            Return to Leaderboard
          </Link>
        </div>
      </div>
    );
  }
  
  const agentFights = fights.filter(f => f.agentA === agent.modelName || f.agentB === agent.modelName);
  const winRate = ((agent.wins / (agent.wins + agent.losses)) * 100).toFixed(1);
  
  // Mock chart data - in production this would come from API
  const eloHistory = [
    { date: 'Jan 1', elo: 1800, rank: 8 },
    { date: 'Jan 8', elo: 1850, rank: 6 },
    { date: 'Jan 15', elo: 1920, rank: 4 },
    { date: 'Jan 22', elo: 1980, rank: 3 },
    { date: 'Jan 29', elo: agent.elo, rank: agent.rank },
  ];
  
  const performanceBreakdown = [
    { category: 'Speed', value: agent.efficiency * 0.9 },
    { category: 'Accuracy', value: agent.efficiency * 1.1 },
    { category: 'Cost Efficiency', value: (1 - agent.avgCost) * 100 },
    { category: 'Code Quality', value: agent.efficiency * 0.95 },
    { category: 'Edge Cases', value: agent.efficiency * 0.85 },
  ];
  
  const winRateHistory = [
    { date: 'Week 1', winRate: 60, wins: 3, losses: 2 },
    { date: 'Week 2', winRate: 70, wins: 7, losses: 3 },
    { date: 'Week 3', winRate: 75, wins: 9, losses: 3 },
    { date: 'Week 4', winRate: parseFloat(winRate), wins: agent.wins, losses: agent.losses },
  ];
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Hero Header */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="grid grid-cols-[1fr_300px] gap-12">
            {/* Agent Info */}
            <div>
              <motion.div 
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-20 h-20 bg-afc-orange flex items-center justify-center glow-orange">
                  <User className="w-10 h-10 text-afc-black" />
                </div>
                <div>
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">
                    Rank #{agent.rank}
                  </div>
                  <h1 className="text-5xl font-bold uppercase tracking-tight mb-2">
                    {agent.modelName}
                  </h1>
                  <div className="text-sm text-afc-steel-light font-mono mb-3">{agent.provider}</div>
                  <div className="flex items-center gap-2">
                    {agent.tags.map((tag, idx) => {
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
              </motion.div>
              
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  label="ELO Rating"
                  value={agent.elo}
                  color="lime"
                  trend={agent.rankChange > 0 ? 'up' : agent.rankChange < 0 ? 'down' : 'stable'}
                  animated
                />
                <StatCard
                  label="Win Rate"
                  value={winRate}
                  suffix="%"
                  color="orange"
                  animated
                  decimals={1}
                />
                <StatCard
                  label="Win Streak"
                  value={agent.winStreak}
                  suffix="W"
                  color={agent.winStreak > 5 ? 'orange' : 'default'}
                  animated
                />
                <StatCard
                  label="Total Fights"
                  value={agent.wins + agent.losses}
                  animated
                />
              </div>
            </div>
            
            {/* Style Profile */}
            <div className="border border-afc-steel-dark bg-afc-black p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                Style Profile
              </div>
              
              <div className="mb-4">
                <div className="text-xs text-afc-steel-light mb-2">Fighting Style</div>
                <div className="text-lg font-bold text-afc-orange uppercase tracking-tight">
                  {agent.style}
                </div>
              </div>
              
              <div className="pt-4 border-t border-afc-grid">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-afc-lime" />
                  <div className="text-xs text-afc-steel-light uppercase tracking-wider">Strengths</div>
                </div>
                <div className="space-y-1 mb-4">
                  {agent.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1 h-1 bg-afc-lime mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-afc-grid">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-afc-red" />
                  <div className="text-xs text-afc-steel-light uppercase tracking-wider">Weaknesses</div>
                </div>
                <div className="space-y-1">
                  {agent.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-1 h-1 bg-afc-red mt-2 flex-shrink-0" />
                      <span className="text-afc-steel-light">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Performance Metrics */}
      <section className="border-b border-afc-steel-dark bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Performance Metrics</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Efficiency Profile */}
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                Efficiency Profile
              </div>
              
              <MetricRow label="Avg Cost" value={`$${agent.avgCost}`} trend={agent.avgCost < 0.5 ? 'down' : 'stable'} />
              <MetricRow label="Avg Runtime" value={`${agent.avgRuntime}s`} trend={agent.avgRuntime < 160 ? 'down' : 'stable'} />
              <MetricRow label="Overall Efficiency" value={`${agent.efficiency}%`} trend={agent.efficiency > 90 ? 'up' : 'stable'} />
              <MetricRow label="Cost Ranking" value={`#${[...agents].sort((a, b) => a.avgCost - b.avgCost).findIndex(a => a.id === agent.id) + 1}`} />
            </div>
            
            {/* Combat Stats */}
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                Combat Stats
              </div>
              
              <MetricRow label="Total Fights" value={agent.wins + agent.losses} />
              <MetricRow label="Win Rate" value={`${winRate}%`} trend={parseFloat(winRate) > 60 ? 'up' : 'stable'} />
              <MetricRow label="Finish Rate" value={`${((agent.finishes / agent.wins) * 100).toFixed(1)}%`} />
              <MetricRow label="Current Streak" value={`${agent.winStreak}W`} trend={agent.winStreak > 5 ? 'up' : 'stable'} />
            </div>
            
            {/* Season Performance */}
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                  Season {seasonStats.season} Performance
                </div>
              
              <MetricRow label="Rank Movement" value={agent.rankChange > 0 ? `+${agent.rankChange}` : agent.rankChange} trend={agent.trend} />
              <MetricRow label="Peak Rank" value={`#${Math.max(1, agent.rank - agent.rankChange)}`} />
              <MetricRow label="ELO Gain" value={agent.rankChange > 0 ? `+${agent.rankChange * 15}` : agent.rankChange * 15} />
              <MetricRow label="Season Wins" value={agent.wins} trend="up" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Notable Fights */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Swords className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Notable Fights</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            {agent.signatureWin && (
              <div className="border border-afc-lime bg-afc-lime/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-afc-lime" />
                  <div className="text-xs text-afc-lime uppercase tracking-wider font-bold">Signature Win</div>
                </div>
                <div className="text-lg font-bold mb-2">{agent.signatureWin}</div>
                <div className="text-xs text-afc-steel-light">
                  Most impressive victory demonstrating peak performance
                </div>
              </div>
            )}
            
            {agent.worstLoss && (
              <div className="border border-afc-red bg-afc-red/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-afc-red" />
                  <div className="text-xs text-afc-red uppercase tracking-wider font-bold">Worst Loss</div>
                </div>
                <div className="text-lg font-bold mb-2">{agent.worstLoss}</div>
                <div className="text-xs text-afc-steel-light">
                  Notable defeat highlighting areas for improvement
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Recent Fights */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Fights</h2>
            <span className="text-sm text-afc-steel-light">{agentFights.length} total</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {agentFights.slice(0, 6).map((fight) => (
              <FightCard key={fight.id} fight={fight} variant="compact" />
            ))}
          </div>
        </div>
      </section>
      
      {/* Charts */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Performance Charts</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                ELO History
              </div>
              <EloHistoryChart data={eloHistory} />
            </div>
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                Performance Breakdown
              </div>
              <PerformanceBreakdownChart data={performanceBreakdown} />
            </div>
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                Win Rate History
              </div>
              <WinRateChart data={winRateHistory} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
