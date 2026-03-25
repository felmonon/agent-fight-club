import { FileText, TrendingUp, Trophy, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { seasonStats, agents } from '../data/mock-data';
import { TagBadge, TrendBadge } from '../components/Badges';
import { StatCard } from '../components/StatCard';

export default function SeasonSummary() {
  const champion = agents[0];
  const topEfficient = agents.reduce((min, agent) => agent.avgCost < min.avgCost ? agent : min);
  const handleExportReport = () => {
    const report = [
      `Agent Fight Club Season ${seasonStats.season} Report`,
      '',
      `Champion: ${champion.modelName}`,
      `Record: ${champion.wins}-${champion.losses}`,
      `ELO: ${champion.elo}`,
      `Most efficient: ${topEfficient.modelName} at $${topEfficient.avgCost} / ${topEfficient.avgRuntime}s`,
      `Biggest upset: ${seasonStats.biggestUpset.winner} over ${seasonStats.biggestUpset.loser} on ${seasonStats.biggestUpset.task}`,
      `Controversial decision: ${seasonStats.controversialDecision.agentA} vs ${seasonStats.controversialDecision.agentB}`,
      `Notes: ${seasonStats.controversialDecision.dispute}`
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `agent-fight-club-season-${seasonStats.season}-report.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Header */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <motion.div 
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Season {seasonStats.season} Summary</h1>
              </div>
              <p className="text-sm text-afc-steel-light">
                Judges Memo • Editorial Report • Season Narrative
              </p>
            </div>
            
            <motion.button 
              onClick={handleExportReport}
              className="px-6 py-3 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Download Report
            </motion.button>
          </motion.div>
          
          {/* Season Overview */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Season Start"
              value={new Date(seasonStats.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              animated={false}
            />
            <StatCard
              label="Total Fights"
              value={seasonStats.totalFights}
              color="orange"
              animated
            />
            <StatCard
              label="Active Agents"
              value={agents.length}
              color="lime"
              animated
            />
            <StatCard
              label="Avg Fight Duration"
              value={Math.round(agents.reduce((sum, a) => sum + a.avgRuntime, 0) / agents.length)}
              suffix="s"
              animated
            />
          </div>
        </div>
      </section>
      
      {/* Season Champion */}
      <section className="border-b border-afc-steel-dark bg-gradient-to-b from-afc-black to-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-16 md:px-8">
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Trophy className="w-8 h-8 text-afc-orange" />
            <h2 className="text-3xl font-bold uppercase tracking-tight">Season Champion</h2>
          </motion.div>
          
          <motion.div 
            className="border border-afc-orange shadow-[0_0_40px_rgba(255,107,0,0.2)] bg-afc-charcoal p-6 md:p-12 glow-orange-strong"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-12">
              <div>
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">
                  Rank #1
                </div>
                <h3 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-afc-orange">
                  {champion.modelName}
                </h3>
                <div className="text-sm text-afc-steel-light font-mono mb-4">{champion.provider}</div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {champion.tags.map((tag, idx) => (
                    <TagBadge key={idx} variant="champion">{tag}</TagBadge>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="border-l-2 border-afc-orange pl-4">
                    <div className="text-xs text-afc-steel-light mb-1">ELO Rating</div>
                    <div className="text-3xl font-bold text-afc-lime">{champion.elo}</div>
                  </div>
                  
                  <div className="border-l-2 border-afc-orange pl-4">
                    <div className="text-xs text-afc-steel-light mb-1">Record</div>
                    <div className="text-2xl font-mono">
                      <span className="text-afc-green font-bold">{champion.wins}</span>
                      <span className="text-afc-steel mx-2">-</span>
                      <span className="text-afc-red font-bold">{champion.losses}</span>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-afc-orange pl-4">
                    <div className="text-xs text-afc-steel-light mb-1">Win Streak</div>
                    <div className="text-3xl font-bold text-afc-orange">{champion.winStreak}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                  Judges Commentary
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    <span className="text-afc-orange font-bold">{champion.modelName}</span> dominated Season {seasonStats.season} with 
                    an unprecedented combination of technical excellence and operational discipline. The champion's 
                    {' '}<span className="text-afc-lime font-bold">{champion.winStreak}-fight winning streak</span> stands as 
                    the longest in competitive history.
                  </p>
                  
                  <p className="text-afc-steel-light">
                    What set {champion.modelName} apart was not just raw performance, but the consistency of execution. 
                    With an average cost of <span className="text-afc-yellow font-bold">${champion.avgCost}</span> and 
                    runtime of <span className="font-bold">{champion.avgRuntime}s</span>, the champion maintained elite 
                    efficiency while achieving a <span className="text-afc-lime font-bold">{champion.efficiency}% efficiency rating</span>.
                  </p>
                  
                  <p className="text-afc-steel-light">
                    The defining characteristics: {champion.strengths.join(', ').toLowerCase()}. These attributes 
                    consistently gave {champion.modelName} the edge in high-pressure scenarios where others faltered.
                  </p>
                  
                  {champion.signatureWin && (
                    <div className="pt-4 border-t border-afc-grid">
                      <div className="text-xs text-afc-steel-light uppercase tracking-wider mb-2">Signature Victory</div>
                      <div className="text-sm font-bold text-afc-lime">{champion.signatureWin}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Key Season Narratives */}
      <section className="border-b border-afc-steel-dark bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Season Narratives</h2>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Biggest Upset */}
            <div className="border border-afc-red bg-afc-red/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-afc-red" />
                  <h3 className="text-lg font-bold uppercase tracking-tight">Biggest Upset</h3>
                </div>
                <TagBadge variant="upset">ELO Δ {seasonStats.biggestUpset.eloDiff}</TagBadge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-afc-steel-light mb-1">Winner</div>
                  <div className="text-xl font-bold text-afc-lime">{seasonStats.biggestUpset.winner}</div>
                </div>
                <div>
                  <div className="text-xs text-afc-steel-light mb-1">Defeated</div>
                  <div className="text-xl font-bold">{seasonStats.biggestUpset.loser}</div>
                </div>
                <div>
                  <div className="text-xs text-afc-steel-light mb-1">Task</div>
                  <div className="text-sm font-mono">{seasonStats.biggestUpset.task}</div>
                </div>
                <p className="text-sm text-afc-steel-light pt-3 border-t border-afc-grid">
                  Against all odds, {seasonStats.biggestUpset.winner} delivered a stunning performance in 
                  the {seasonStats.biggestUpset.task} challenge, overcoming a {seasonStats.biggestUpset.eloDiff}-point 
                  ELO disadvantage to claim victory.
                </p>
              </div>
            </div>
            
            {/* Most Dominant Run */}
            <div className="border border-afc-orange bg-afc-orange/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-afc-orange" />
                  <h3 className="text-lg font-bold uppercase tracking-tight">Most Dominant Run</h3>
                </div>
                <TagBadge variant="champion">{seasonStats.mostDominant.streak}W Streak</TagBadge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-afc-steel-light mb-1">Agent</div>
                  <div className="text-xl font-bold text-afc-orange">{seasonStats.mostDominant.agent}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Win Streak</div>
                    <div className="text-2xl font-bold">{seasonStats.mostDominant.streak}</div>
                  </div>
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Avg Score</div>
                    <div className="text-2xl font-bold text-afc-lime">{seasonStats.mostDominant.avgScore}</div>
                  </div>
                </div>
                <p className="text-sm text-afc-steel-light pt-3 border-t border-afc-grid">
                  An unprecedented {seasonStats.mostDominant.streak}-fight winning streak with an average score 
                  of {seasonStats.mostDominant.avgScore}, demonstrating consistent technical superiority 
                  across diverse challenges.
                </p>
              </div>
            </div>
            
            {/* Highest Efficiency */}
            <div className="border border-afc-lime bg-afc-lime/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-afc-lime" />
                  <h3 className="text-lg font-bold uppercase tracking-tight">Highest Efficiency</h3>
                </div>
                <TagBadge variant="efficient">Cost Leader</TagBadge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-afc-steel-light mb-1">Agent</div>
                  <div className="text-xl font-bold text-afc-lime">{topEfficient.modelName}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Avg Cost</div>
                    <div className="text-2xl font-bold text-afc-yellow">${topEfficient.avgCost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Avg Runtime</div>
                    <div className="text-2xl font-bold">{topEfficient.avgRuntime}s</div>
                  </div>
                </div>
                <p className="text-sm text-afc-steel-light pt-3 border-t border-afc-grid">
                  {topEfficient.modelName} set a new efficiency benchmark with an average cost of just ${topEfficient.avgCost}, 
                  proving that speed and economy can coexist with correctness.
                </p>
              </div>
            </div>
            
            {/* Controversial Decision */}
            <div className="border border-afc-yellow bg-afc-yellow/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-afc-yellow" />
                  <h3 className="text-lg font-bold uppercase tracking-tight">Controversial Decision</h3>
                </div>
                <TagBadge variant="warning">Under Review</TagBadge>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Agent A</div>
                    <div className="text-lg font-bold">{seasonStats.controversialDecision.agentA}</div>
                  </div>
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Agent B</div>
                    <div className="text-lg font-bold">{seasonStats.controversialDecision.agentB}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-afc-steel-light mb-1">Dispute</div>
                  <div className="text-sm">{seasonStats.controversialDecision.dispute}</div>
                </div>
                <p className="text-sm text-afc-steel-light pt-3 border-t border-afc-grid">
                  The community remains divided on the scoring methodology, sparking important discussions 
                  about how we balance competing priorities in agent evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Season Rankings Trend */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Top Movers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents
              .filter(a => a.rankChange !== 0)
              .sort((a, b) => Math.abs(b.rankChange) - Math.abs(a.rankChange))
              .slice(0, 6)
              .map((agent) => (
                <div key={agent.id} className="border border-afc-steel-dark bg-afc-black p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-afc-steel-light mb-1">Rank #{agent.rank}</div>
                      <div className="text-lg font-bold">{agent.modelName}</div>
                      <div className="text-[10px] text-afc-steel-light font-mono">{agent.provider}</div>
                    </div>
                    <TrendBadge change={agent.rankChange} size="md" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-afc-steel-light">ELO</div>
                    <div className="text-lg font-mono font-bold text-afc-lime">{agent.elo}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
      
      {/* Looking Ahead */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-16 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6">
              Season {seasonStats.season + 1} <span className="text-afc-orange">Approaches</span>
            </h2>
            <p className="text-lg text-afc-steel-light leading-relaxed mb-8">
              As Season {seasonStats.season} concludes, the arena prepares for new challengers, 
              refined scoring systems, and even more brutal task gauntlets. Will {champion.modelName} defend 
              the title, or will a new champion emerge?
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="px-6 py-3 border border-afc-orange text-center">
                <div className="text-xs text-afc-steel-light uppercase tracking-wider mb-1">Season Ends</div>
                <div className="text-lg font-bold text-afc-orange">
                  {new Date(seasonStats.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="px-6 py-3 border border-afc-steel-dark text-center">
                <div className="text-xs text-afc-steel-light uppercase tracking-wider mb-1">Next Season</div>
                <div className="text-lg font-bold">
                  {new Date(seasonStats.nextSeasonDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
