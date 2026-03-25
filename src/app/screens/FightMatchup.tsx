import { useParams, Link } from 'react-router-dom';
import { Swords, AlertCircle, TrendingUp, Target, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { fights, agents } from '../data/mock-data';
import { StatChip, ScoreBadge, TagBadge } from '../components/Badges';
import { useLiveSimulation } from '../hooks/useLiveSimulation';

export default function FightMatchup() {
  const { id } = useParams();
  const fight = fights.find(f => f.id === id);
  const { events } = useLiveSimulation(fight?.status === 'live');
  
  if (!fight) {
    return (
      <div className="min-h-screen bg-afc-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-afc-steel-dark mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-afc-steel mb-2">Fight Not Found</h2>
          <Link to="/" className="text-afc-orange hover:text-afc-orange/80">
            Return to Arena
          </Link>
        </div>
      </div>
    );
  }
  
  const agentA = agents.find(a => a.modelName === fight.agentA);
  const agentB = agents.find(a => a.modelName === fight.agentB);
  const isCompleted = fight.status === 'completed';
  const isLive = fight.status === 'live';
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Fight Status Banner */}
      <motion.section 
        className={`border-b border-afc-steel-dark ${isLive ? 'bg-afc-red glow-red' : 'bg-afc-orange'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between text-afc-black">
            <div className="flex items-center gap-3">
              {isLive && <div className="w-3 h-3 bg-afc-black animate-pulse" />}
              <Swords className="w-6 h-6" />
              <span className="text-xl font-bold uppercase tracking-wider">
                {isCompleted ? 'Fight Complete' : isLive ? 'Live Now' : 'Scheduled'}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
              <div>Task: {fight.taskType.replace('_', ' ')}</div>
              <div>•</div>
              <div>{new Date(fight.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Main Faceoff */}
      <section className="border-b border-afc-steel-dark bg-gradient-to-b from-afc-charcoal to-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-16">
          <div className="grid grid-cols-[1fr_200px_1fr] gap-12 items-center">
            {/* Fighter A */}
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {agentA && (
                <>
                  <Link 
                    to={`/agent/${agentA.id}`}
                    className="inline-block mb-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">
                      Rank #{agentA.rank}
                    </div>
                    <motion.h2 
                      className={`text-5xl font-bold uppercase tracking-tighter mb-3 ${isCompleted && fight.winner === fight.agentA ? 'text-afc-lime glow-lime' : 'text-foreground'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {fight.agentA}
                    </motion.h2>
                    <div className="flex justify-end gap-1 mb-4">
                      {agentA.tags.slice(0, 2).map((tag, idx) => (
                        <TagBadge key={idx} variant={idx === 0 ? 'champion' : 'default'}>
                          {tag}
                        </TagBadge>
                      ))}
                    </div>
                  </Link>
                  
                  <div className="inline-block space-y-2 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-afc-steel-light uppercase tracking-wider w-20">ELO</span>
                      <span className="text-2xl font-bold font-mono text-afc-lime">{agentA.elo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-afc-steel-light uppercase tracking-wider w-20">Record</span>
                      <span className="text-lg font-mono">
                        <span className="text-afc-green font-bold">{agentA.wins}</span>
                        <span className="text-afc-steel mx-1">-</span>
                        <span className="text-afc-red font-bold">{agentA.losses}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-afc-steel-light uppercase tracking-wider w-20">Streak</span>
                      <span className="text-lg font-bold text-afc-orange">{agentA.winStreak}W</span>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="mt-6 flex justify-end">
                      <ScoreBadge score={fight.scoreA} size="lg" variant="glow" />
                    </div>
                  )}
                </>
              )}
            </motion.div>
            
            {/* VS Divider */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-afc-orange flex items-center justify-center">
                <Swords className="w-12 h-12 text-afc-black" />
              </div>
              <div className="text-3xl font-bold uppercase tracking-widest text-afc-orange">
                VS
              </div>
              {isCompleted && fight.winner && (
                <div className="text-center mt-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">
                    Winner
                  </div>
                  <div className="text-xl font-bold text-afc-lime">
                    {fight.winner}
                  </div>
                </div>
              )}
            </div>
            
            {/* Fighter B */}
            <motion.div 
              className="text-left"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {agentB && (
                <>
                  <Link 
                    to={`/agent/${agentB.id}`}
                    className="inline-block mb-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">
                      Rank #{agentB.rank}
                    </div>
                    <motion.h2 
                      className={`text-5xl font-bold uppercase tracking-tighter mb-3 ${isCompleted && fight.winner === fight.agentB ? 'text-afc-lime glow-lime' : 'text-foreground'}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {fight.agentB}
                    </motion.h2>
                    <div className="flex gap-1 mb-4">
                      {agentB.tags.slice(0, 2).map((tag, idx) => (
                        <TagBadge key={idx} variant={idx === 0 ? 'champion' : 'default'}>
                          {tag}
                        </TagBadge>
                      ))}
                    </div>
                  </Link>
                  
                  <div className="inline-block space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-afc-steel-light uppercase tracking-wider w-20">ELO</span>
                      <span className="text-2xl font-bold font-mono text-afc-lime">{agentB.elo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-afc-steel-light uppercase tracking-wider w-20">Record</span>
                      <span className="text-lg font-mono">
                        <span className="text-afc-green font-bold">{agentB.wins}</span>
                        <span className="text-afc-steel mx-1">-</span>
                        <span className="text-afc-red font-bold">{agentB.losses}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-afc-steel-light uppercase tracking-wider w-20">Streak</span>
                      <span className="text-lg font-bold text-afc-orange">{agentB.winStreak}W</span>
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <div className="mt-6">
                      <ScoreBadge score={fight.scoreB} size="lg" variant="glow" />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Comparison */}
      {agentA && agentB && (
        <section className="border-b border-afc-steel-dark bg-afc-black">
          <div className="max-w-[1600px] mx-auto px-8 py-12">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-afc-orange" />
              <h3 className="text-2xl font-bold uppercase tracking-tight">Pre-Fight Comparison</h3>
            </div>
            
            <div className="grid grid-cols-[1fr_200px_1fr] gap-6">
              {/* Agent A Stats */}
              <div className="space-y-4">
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                    Style Profile
                  </div>
                  <div className="text-lg font-bold text-afc-orange uppercase tracking-tight mb-2">
                    {agentA.style}
                  </div>
                  <div className="text-sm text-afc-steel-light">{agentA.strengths[0]}</div>
                </div>
                
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Avg Cost</div>
                      <div className={`text-2xl font-bold ${agentA.avgCost < agentB.avgCost ? 'text-afc-lime' : 'text-foreground'}`}>
                        ${agentA.avgCost}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Avg Runtime</div>
                      <div className={`text-2xl font-bold ${agentA.avgRuntime < agentB.avgRuntime ? 'text-afc-lime' : 'text-foreground'}`}>
                        {agentA.avgRuntime}s
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
                    Strengths
                  </div>
                  <div className="space-y-1">
                    {agentA.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Shield className="w-3 h-3 text-afc-lime flex-shrink-0" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Expected Edge */}
              <div className="flex flex-col justify-center">
                <div className="border border-afc-orange bg-afc-orange/10 p-6 text-center">
                  <div className="text-[10px] text-afc-orange uppercase tracking-wider mb-2 font-bold">
                    Expected Edge
                  </div>
                  <div className="text-3xl font-bold text-afc-orange mb-2">
                    {Math.abs(agentA.elo - agentB.elo)}
                  </div>
                  <div className="text-xs text-afc-steel-light">
                    ELO difference
                  </div>
                  <div className="mt-4 pt-4 border-t border-afc-orange/20">
                    <div className="text-sm font-bold">
                      {agentA.elo > agentB.elo ? fight.agentA : fight.agentB}
                    </div>
                    <div className="text-[10px] text-afc-steel-light uppercase mt-1">Favored</div>
                  </div>
                </div>
              </div>
              
              {/* Agent B Stats */}
              <div className="space-y-4">
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                    Style Profile
                  </div>
                  <div className="text-lg font-bold text-afc-orange uppercase tracking-tight mb-2">
                    {agentB.style}
                  </div>
                  <div className="text-sm text-afc-steel-light">{agentB.strengths[0]}</div>
                </div>
                
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Avg Cost</div>
                      <div className={`text-2xl font-bold ${agentB.avgCost < agentA.avgCost ? 'text-afc-lime' : 'text-foreground'}`}>
                        ${agentB.avgCost}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Avg Runtime</div>
                      <div className={`text-2xl font-bold ${agentB.avgRuntime < agentA.avgRuntime ? 'text-afc-lime' : 'text-foreground'}`}>
                        {agentB.avgRuntime}s
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
                    Strengths
                  </div>
                  <div className="space-y-1">
                    {agentB.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Shield className="w-3 h-3 text-afc-lime flex-shrink-0" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Task Details */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-6 h-6 text-afc-orange" />
            <h3 className="text-2xl font-bold uppercase tracking-tight">Task Challenge</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-afc-steel-dark bg-afc-black p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                Task Type
              </div>
              <div className="text-2xl font-bold text-afc-orange uppercase tracking-tight mb-2">
                {fight.taskType.replace('_', ' ')}
              </div>
              <div className="text-sm text-afc-steel-light">Repository: {fight.repository}</div>
            </div>
            
            <div className="border border-afc-steel-dark bg-afc-black p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                Constraints
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-afc-steel-light">Budget</span>
                  <span className="font-bold text-afc-yellow">$1.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-afc-steel-light">Timeout</span>
                  <span className="font-bold">300s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-afc-steel-light">Rounds</span>
                  <span className="font-bold">{fight.rounds}</span>
                </div>
              </div>
            </div>
            
            <div className="border border-afc-steel-dark bg-afc-black p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                Tools Available
              </div>
              <div className="flex flex-wrap gap-1">
                {['profiler', 'analyzer', 'test-runner'].map((tool, idx) => (
                  <span key={idx} className="px-2 py-1 bg-afc-steel-dark text-[10px] font-mono text-afc-steel-light">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Action CTA */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-12 text-center">
          {isCompleted ? (
            <>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
                View Full <span className="text-afc-orange">Replay Analysis</span>
              </h3>
              <Link 
                to="/replay"
                className="inline-flex items-center gap-2 px-8 py-4 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Watch Replay
              </Link>
            </>
          ) : isLive ? (
            <>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
                <span className="text-afc-red">Battle in Progress</span>
              </h3>
              <Link 
                to="/live"
                className="inline-flex items-center gap-2 px-8 py-4 bg-afc-red text-white font-bold uppercase tracking-wider hover:bg-afc-red/90 transition-colors animate-pulse"
              >
                Watch Live
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
                Fight <span className="text-afc-orange">Scheduled</span>
              </h3>
              <div className="text-afc-steel-light">
                Check back at {new Date(fight.timestamp).toLocaleString()}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
