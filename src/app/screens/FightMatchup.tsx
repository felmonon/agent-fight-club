import { useParams, Link } from 'react-router-dom';
import { Swords, AlertCircle, TrendingUp, Target, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { fights, agents, getFightInsight } from '../data/mock-data';
import { ScoreBadge, TagBadge } from '../components/Badges';
import { useLiveSimulation } from '../hooks/useLiveSimulation';

export default function FightMatchup() {
  const { id } = useParams();
  const fight = fights.find((entry) => entry.id === id);
  const insight = fight ? getFightInsight(fight.id) : undefined;
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

  const agentA = agents.find((entry) => entry.modelName === fight.agentA);
  const agentB = agents.find((entry) => entry.modelName === fight.agentB);
  const isCompleted = fight.status === 'completed';
  const isLive = fight.status === 'live';
  const winnerIsBlue = isCompleted && fight.winner === fight.agentA;

  return (
    <div className="min-h-screen bg-afc-black">
      <motion.section
        className={`border-b border-afc-steel-dark ${isLive ? 'bg-afc-red glow-red' : 'bg-afc-orange'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-[1600px] mx-auto px-4 py-4 md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between text-afc-black">
            <div className="flex items-center gap-3">
              {isLive && <div className="w-3 h-3 bg-afc-black animate-pulse" />}
              <Swords className="w-6 h-6" />
              <span className="text-lg md:text-xl font-bold uppercase tracking-wider">
                {isCompleted ? 'Fight Complete' : isLive ? 'Live Now' : 'Scheduled'}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs md:text-sm font-bold uppercase tracking-wider lg:flex-row lg:items-center lg:gap-4">
              <div>Task: {fight.taskType.replaceAll('_', ' ')}</div>
              <div className="hidden lg:block">•</div>
              <div>{new Date(fight.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="border-b border-afc-steel-dark bg-gradient-to-b from-afc-charcoal to-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-16 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-10 lg:gap-12 items-center">
            <motion.div
              className="text-center lg:text-right"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {agentA && (
                <>
                  <Link to={`/agent/${agentA.id}`} className="inline-block mb-4 hover:opacity-80 transition-opacity">
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">Rank #{agentA.rank}</div>
                    <motion.h2
                      className={`text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-3 ${
                        winnerIsBlue ? 'text-afc-lime glow-lime' : 'text-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {fight.agentA}
                    </motion.h2>
                    <div className="flex flex-wrap justify-center gap-1 mb-4 lg:justify-end">
                      {agentA.tags.slice(0, 2).map((tag, index) => (
                        <TagBadge key={tag} variant={index === 0 ? 'champion' : 'default'}>
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
                    <div className="mt-6 flex justify-center lg:justify-end">
                      <ScoreBadge score={fight.scoreA} size="lg" variant="glow" />
                    </div>
                  )}
                </>
              )}
            </motion.div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-afc-orange flex items-center justify-center">
                <Swords className="w-12 h-12 text-afc-black" />
              </div>
              <div className="text-3xl font-bold uppercase tracking-widest text-afc-orange">VS</div>
              {isCompleted && fight.winner && (
                <div className="text-center mt-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">Winner</div>
                  <div className="text-xl font-bold text-afc-lime">{fight.winner}</div>
                </div>
              )}
            </div>

            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {agentB && (
                <>
                  <Link to={`/agent/${agentB.id}`} className="inline-block mb-4 hover:opacity-80 transition-opacity">
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">Rank #{agentB.rank}</div>
                    <motion.h2
                      className={`text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-3 ${
                        isCompleted && !winnerIsBlue ? 'text-afc-lime glow-lime' : 'text-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {fight.agentB}
                    </motion.h2>
                    <div className="flex flex-wrap justify-center gap-1 mb-4 lg:justify-start">
                      {agentB.tags.slice(0, 2).map((tag, index) => (
                        <TagBadge key={tag} variant={index === 0 ? 'champion' : 'default'}>
                          {tag}
                        </TagBadge>
                      ))}
                    </div>
                  </Link>

                  <div className="inline-block space-y-2 text-left">
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
                    <div className="mt-6 flex justify-center lg:justify-start">
                      <ScoreBadge score={fight.scoreB} size="lg" variant="glow" />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {agentA && agentB && (
        <section className="border-b border-afc-steel-dark bg-afc-black">
          <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-afc-orange" />
              <h3 className="text-2xl font-bold uppercase tracking-tight">Corner Comparison</h3>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px_1fr] gap-6">
              <div className="space-y-4">
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">Style Profile</div>
                  <div className="text-lg font-bold text-afc-orange uppercase tracking-tight mb-2">{agentA.style}</div>
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
              </div>

              <div className="flex flex-col justify-center">
                <div className="border border-afc-orange bg-afc-orange/10 p-6 text-center">
                  <div className="text-[10px] text-afc-orange uppercase tracking-wider mb-2 font-bold">Expected Edge</div>
                  <div className="text-3xl font-bold text-afc-orange mb-2">{Math.abs(agentA.elo - agentB.elo)}</div>
                  <div className="text-xs text-afc-steel-light">ELO difference</div>
                  <div className="mt-4 pt-4 border-t border-afc-orange/20">
                    <div className="text-sm font-bold">{agentA.elo > agentB.elo ? fight.agentA : fight.agentB}</div>
                    <div className="text-[10px] text-afc-steel-light uppercase mt-1">Favored</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">Style Profile</div>
                  <div className="text-lg font-bold text-afc-orange uppercase tracking-tight mb-2">{agentB.style}</div>
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
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6">
            <div className="border border-afc-steel-dark bg-afc-black p-6">
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                {isLive ? 'Live Judges Feed' : 'Judges Memo'}
              </div>
              {isLive ? (
                <div className="space-y-2 text-sm font-mono">
                  {events.map((event) => (
                    <div key={`${event.timestamp}-${event.message}`} className="flex items-start gap-3">
                      <span className="text-afc-steel-light">{event.timestamp}</span>
                      <span
                        className={
                          event.type === 'success'
                            ? 'text-afc-lime'
                            : event.type === 'warning'
                            ? 'text-afc-yellow'
                            : event.type === 'error'
                            ? 'text-afc-red'
                            : 'text-foreground'
                        }
                      >
                        {event.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-afc-steel-light leading-relaxed">{insight?.judgesMemo}</p>
              )}

              <div className="pt-6 mt-6 border-t border-afc-grid">
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">Key Moments</div>
                <div className="space-y-3">
                  {(insight?.keyMoments ?? []).map((moment, index) => (
                    <div key={moment} className="flex items-start gap-3">
                      <div className={`mt-2 h-1.5 w-1.5 flex-shrink-0 ${index === 0 ? 'bg-afc-lime' : index === 1 ? 'bg-afc-yellow' : 'bg-afc-orange'}`} />
                      <span className="text-sm text-afc-steel-light">{moment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-afc-steel-dark bg-afc-black p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-afc-orange" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Task Brief</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Repository</div>
                    <div className="text-sm font-mono">{fight.repository}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Challenge</div>
                    <div className="text-lg font-bold text-afc-orange">{insight?.task?.name.replaceAll('_', ' ') ?? fight.taskType.replaceAll('_', ' ')}</div>
                  </div>
                  <p className="text-sm text-afc-steel-light leading-relaxed">
                    {insight?.task?.constraints
                      ? `Budget $${insight.task.constraints.budget.toFixed(1)}, timeout ${insight.task.constraints.timeout}s, ${insight.task.constraints.tools.length} tools available.`
                      : 'Standard AFC contract: same repo, same budget, same scoring rubric.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="border border-afc-steel-dark bg-afc-charcoal p-3">
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Rounds</div>
                      <div className="text-lg font-bold">{fight.rounds}</div>
                    </div>
                    <div className="border border-afc-steel-dark bg-afc-charcoal p-3">
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">Finish</div>
                      <div className="text-lg font-bold">{insight?.finish ?? 'Pending'}</div>
                    </div>
                  </div>
                  {insight?.task?.constraints && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {insight.task.constraints.tools.map((tool) => (
                        <span key={tool} className="px-2 py-1 bg-afc-steel-dark text-[10px] font-mono text-afc-steel-light">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-afc-steel-dark bg-afc-black p-5">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">{fight.agentA} Plan</div>
                  <div className="space-y-3 text-sm">
                    <p>{insight?.blue.promptStyle}</p>
                    <p className="text-afc-steel-light">{insight?.blue.diffSummary}</p>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-afc-lime mt-0.5 flex-shrink-0" />
                      <span className="text-afc-steel-light">{insight?.blue.notableMove}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-afc-steel-dark bg-afc-black p-5">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">{fight.agentB} Plan</div>
                  <div className="space-y-3 text-sm">
                    <p>{insight?.red.promptStyle}</p>
                    <p className="text-afc-steel-light">{insight?.red.diffSummary}</p>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-afc-lime mt-0.5 flex-shrink-0" />
                      <span className="text-afc-steel-light">{insight?.red.notableMove}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 text-center md:px-8">
          {isCompleted ? (
            <>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
                View Full <span className="text-afc-orange">Replay Desk</span>
              </h3>
              <Link
                to="/replay"
                className="inline-flex min-h-12 items-center gap-2 px-8 py-4 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Open Replay Desk
              </Link>
            </>
          ) : isLive ? (
            <>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
                <span className="text-afc-red">Battle in Progress</span>
              </h3>
              <Link
                to="/live"
                className="inline-flex min-h-12 items-center gap-2 px-8 py-4 bg-afc-red text-white font-bold uppercase tracking-wider hover:bg-afc-red/90 transition-colors animate-pulse"
              >
                Watch Live
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-6">
                Fight <span className="text-afc-orange">Scheduled</span>
              </h3>
              <div className="text-afc-steel-light">Check back at {new Date(fight.timestamp).toLocaleString()}</div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
