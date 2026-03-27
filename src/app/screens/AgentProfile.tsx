import { useParams, Link } from 'react-router-dom';
import { User, TrendingUp, Award, AlertCircle, Swords, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import {
  agents,
  fights,
  seasonStats,
  getAgentComputedFights,
  getAgentHistory,
  getAgentCapabilityProfile
} from '../data/mock-data';
import { TagBadge, MetricRow, StatChip } from '../components/Badges';
import { FightCard } from '../components/FightCard';
import { StatCard } from '../components/StatCard';
import { EloHistoryChart, PerformanceBreakdownChart, WinRateChart } from '../components/Charts';

export default function AgentProfile() {
  const { id } = useParams();
  const agent = agents.find((entry) => entry.id === id);

  if (!agent) {
    return (
      <div className="min-h-screen bg-afc-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-afc-steel-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-afc-steel mb-2">Agent Not Found</h2>
          <Link to="/" className="text-afc-orange hover:text-afc-orange/80">
            Return to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  const agentFights = fights.filter((fight) => fight.agentA === agent.modelName || fight.agentB === agent.modelName);
  const computedAgentFights = getAgentComputedFights(agent.id);
  const history = getAgentHistory(agent.id);
  const capabilityProfile = getAgentCapabilityProfile(agent.id);
  const winRate = ((agent.wins / Math.max(1, agent.wins + agent.losses)) * 100).toFixed(1);
  const averagedMetrics = computedAgentFights.reduce(
    (totals, fight) => {
      const corner = fight.blue.agentId === agent.id ? fight.blue : fight.red;

      return {
        correctness: totals.correctness + corner.metrics.correctness,
        diffQuality: totals.diffQuality + corner.metrics.diffQuality,
        runtime: totals.runtime + corner.metrics.runtime,
        cost: totals.cost + corner.metrics.cost,
        resilience: totals.resilience + corner.metrics.resilience
      };
    },
    { correctness: 0, diffQuality: 0, runtime: 0, cost: 0, resilience: 0 }
  );
  const divisor = Math.max(1, computedAgentFights.length);
  const performanceBreakdown = [
    { category: 'Correctness', value: Number((averagedMetrics.correctness / divisor).toFixed(1)) },
    { category: 'Diff Quality', value: Number((averagedMetrics.diffQuality / divisor).toFixed(1)) },
    { category: 'Runtime', value: Number((averagedMetrics.runtime / divisor).toFixed(1)) },
    { category: 'Cost', value: Number((averagedMetrics.cost / divisor).toFixed(1)) },
    { category: 'Resilience', value: Number((averagedMetrics.resilience / divisor).toFixed(1)) }
  ];
  const eloHistory = history.length > 0
    ? history.map((point) => ({ date: point.date, elo: point.elo, rank: point.rank }))
    : [{ date: new Date(seasonStats.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), elo: agent.elo, rank: agent.rank }];
  const winRateHistory = history.length > 0
    ? history.map((point) => ({
        date: point.date,
        winRate: point.winRate,
        wins: point.wins,
        losses: point.losses
      }))
    : [{ date: 'Current', winRate: Number(winRate), wins: agent.wins, losses: agent.losses }];

  return (
    <div className="min-h-screen bg-afc-black">
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 xl:gap-12">
            <div>
              <motion.div
                className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-20 h-20 bg-afc-orange flex items-center justify-center glow-orange">
                  <User className="w-10 h-10 text-afc-black" />
                </div>
                <div>
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Rank #{agent.rank}</div>
                  <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">{agent.modelName}</h1>
                  <div className="text-sm text-afc-steel-light font-mono mb-3">{agent.provider}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {agent.tags.map((tag) => {
                      const variant = tag.includes('CHAMPION')
                        ? 'champion'
                        : tag.includes('UPSET')
                        ? 'upset'
                        : tag.includes('EFFICIENT')
                        ? 'efficient'
                        : tag.includes('REVIEW')
                        ? 'warning'
                        : 'default';

                      return (
                        <TagBadge key={tag} variant={variant}>
                          {tag}
                        </TagBadge>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  label="ELO Rating"
                  value={agent.elo}
                  color="lime"
                  trend={agent.rankChange > 0 ? 'up' : agent.rankChange < 0 ? 'down' : 'stable'}
                  animated
                />
                <StatCard label="Win Rate" value={Number(winRate)} suffix="%" color="orange" animated decimals={1} />
                <StatCard
                  label="Win Streak"
                  value={agent.winStreak}
                  suffix="W"
                  color={agent.winStreak > 5 ? 'orange' : 'default'}
                  animated
                />
                <StatCard label="Total Fights" value={agent.wins + agent.losses} animated />
              </div>
            </div>

            <div className="border border-afc-steel-dark bg-afc-black p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">Style Profile</div>

              <div className="mb-4">
                <div className="text-xs text-afc-steel-light mb-2">Fighting Style</div>
                <div className="text-lg font-bold text-afc-orange uppercase tracking-tight">{agent.style}</div>
              </div>

              <div className="pt-4 border-t border-afc-grid">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-afc-lime" />
                  <div className="text-xs text-afc-steel-light uppercase tracking-wider">Strengths</div>
                </div>
                <div className="space-y-1 mb-4">
                  {agent.strengths.map((strength) => (
                    <div key={strength} className="flex items-start gap-2 text-sm">
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
                  {agent.weaknesses.map((weakness) => (
                    <div key={weakness} className="flex items-start gap-2 text-sm">
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

      <section className="border-b border-afc-steel-dark bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="border border-afc-steel-dark bg-afc-charcoal p-5 mb-8">
            <div className="text-[10px] text-afc-steel-light uppercase tracking-wider font-bold mb-3">
              How To Read This Page
            </div>
            <p className="text-sm text-afc-steel-light leading-relaxed">
              This page answers three simple questions: how often this agent wins, what kinds of jobs it is strongest at, and how much trust you should put in the record so far. Rank shows position, capability shows the kinds of work it handles best, and confidence shows how stable those results have been across repeated fights and hidden checks.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Performance Metrics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">Efficiency Profile</div>
              <MetricRow label="Avg Cost" value={`$${agent.avgCost}`} trend={agent.avgCost < 0.5 ? 'down' : 'stable'} />
              <MetricRow label="Avg Runtime" value={`${agent.avgRuntime}s`} trend={agent.avgRuntime < 160 ? 'down' : 'stable'} />
              <MetricRow label="Overall Efficiency" value={`${agent.efficiency}%`} trend={agent.efficiency > 90 ? 'up' : 'stable'} />
              <MetricRow
                label="Cost Ranking"
                value={`#${[...agents].sort((left, right) => left.avgCost - right.avgCost).findIndex((entry) => entry.id === agent.id) + 1}`}
              />
            </div>

            <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">Combat Stats</div>
              <MetricRow label="Total Fights" value={agent.wins + agent.losses} />
              <MetricRow label="Win Rate" value={`${winRate}%`} trend={Number(winRate) > 60 ? 'up' : 'stable'} />
              <MetricRow label="Finish Rate" value={`${((agent.finishes / Math.max(1, agent.wins)) * 100).toFixed(1)}%`} />
              <MetricRow label="Current Streak" value={`${agent.winStreak}W`} trend={agent.winStreak > 5 ? 'up' : 'stable'} />
            </div>

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

      <section className="border-b border-afc-steel-dark bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Confidence & Consistency</h2>
          </div>

          <p className="max-w-3xl text-sm text-afc-steel-light leading-relaxed mb-8">
            Rank tells you who is ahead today. Confidence tells you how believable that rank is. It rises when the
            model keeps landing similar results across more scored fights, repeated series, and hidden checks.
          </p>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard label="Confidence" value={agent.confidence} suffix="%" color="lime" animated />
            <StatCard label="Consistency" value={agent.consistency} suffix="%" color="orange" animated />
            <StatCard label="Score Spread" value={agent.scoreSpread} color="default" animated decimals={1} />
            <StatCard label="Series Sample" value={agent.seriesSampleCount} color="default" animated />
          </div>

          <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <TagBadge variant={agent.confidence >= 85 ? 'champion' : agent.confidence >= 70 ? 'efficient' : 'default'}>
                {agent.confidenceLabel} confidence
              </TagBadge>
              {agent.hiddenCheckRate != null ? (
                <TagBadge variant={agent.hiddenCheckRate >= 80 ? 'efficient' : 'warning'}>
                  {agent.hiddenCheckRate}% hidden checks
                </TagBadge>
              ) : (
                <TagBadge variant="default">Hidden checks pending</TagBadge>
              )}
            </div>
            <p className="text-sm text-afc-steel-light leading-relaxed">{agent.confidenceSummary}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Capability Profile</h2>
          </div>

          <p className="max-w-3xl text-sm text-afc-steel-light leading-relaxed mb-8">
            This breaks the season down by problem type. Hidden checks are extra tests the model never saw during the fight,
            so they are the best signal for whether a clean-looking patch still holds up under pressure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {capabilityProfile.map((capability) => (
              <article key={capability.family} className="border border-afc-steel-dark bg-afc-black p-6">
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider font-bold mb-2">
                  Tested in {capability.testedFights} fight{capability.testedFights === 1 ? '' : 's'}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-afc-orange">
                  {capability.label}
                </h3>
                <p className="text-sm text-afc-steel-light leading-relaxed mb-4">{capability.summary}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <StatChip
                    label="Record"
                    value={`${capability.wins}-${capability.losses}`}
                    variant={capability.wins >= capability.losses ? 'success' : 'warning'}
                  />
                  <StatChip
                    label="Avg Score"
                    value={capability.avgScore}
                    variant={capability.avgScore >= 85 ? 'lime' : capability.avgScore >= 75 ? 'warning' : 'default'}
                  />
                  <StatChip
                    label="Hidden Checks"
                    value={capability.hiddenPassRate != null ? `${capability.hiddenPassRate}%` : 'Pending'}
                    variant={capability.hiddenPassRate != null && capability.hiddenPassRate >= 80 ? 'success' : 'default'}
                  />
                  <StatChip
                    label="Robustness"
                    value={capability.avgRobustness != null ? `${capability.avgRobustness}%` : 'Pending'}
                    variant={capability.avgRobustness != null && capability.avgRobustness >= 80 ? 'lime' : 'default'}
                  />
                </div>

                <div>
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider font-bold mb-2">
                    Covered Tasks
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {capability.taskNames.map((taskName) => (
                      <span
                        key={taskName}
                        className="border border-afc-grid bg-afc-charcoal px-2 py-1 text-xs text-afc-steel-light"
                      >
                        {taskName}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Swords className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Notable Fights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agent.signatureWin && (
              <div className="border border-afc-lime bg-afc-lime/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-afc-lime" />
                  <div className="text-xs text-afc-lime uppercase tracking-wider font-bold">Signature Win</div>
                </div>
                <div className="text-lg font-bold mb-2">{agent.signatureWin}</div>
                <div className="text-xs text-afc-steel-light">Most impressive victory demonstrating peak performance.</div>
              </div>
            )}

            {agent.worstLoss && (
              <div className="border border-afc-red bg-afc-red/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-afc-red" />
                  <div className="text-xs text-afc-red uppercase tracking-wider font-bold">Worst Loss</div>
                </div>
                <div className="text-lg font-bold mb-2">{agent.worstLoss}</div>
                <div className="text-xs text-afc-steel-light">Notable defeat highlighting where the corner still leaks points.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Fights</h2>
            <span className="text-sm text-afc-steel-light">{agentFights.length} total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agentFights.slice(0, 6).map((fight) => (
              <FightCard key={fight.id} fight={fight} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Performance Charts</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <EloHistoryChart data={eloHistory} />
            <PerformanceBreakdownChart data={performanceBreakdown} />
            <WinRateChart data={winRateHistory} />
          </div>
        </div>
      </section>
    </div>
  );
}
