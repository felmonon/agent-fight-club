import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { fights, getFightInsight } from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { FilterBar } from '../components/FilterBar';
import { useFilter, useSort } from '../hooks/useFilter';

export default function ReplayDesk() {
  const completedFights = fights.filter((fight) => fight.status === 'completed');
  const taskTypes = ['All', ...Array.from(new Set(completedFights.map((fight) => fight.taskType.replaceAll('_', ' '))))];

  const { filteredItems, activeFilter, setActiveFilter, searchTerm, setSearchTerm } = useFilter({
    items: completedFights,
    filterKey: 'taskType',
    searchKeys: ['agentA', 'agentB']
  });

  const { sortedItems } = useSort({
    items: filteredItems,
    initialKey: 'id',
    initialDirection: 'desc'
  });

  const featuredFight = sortedItems[0];
  const featuredInsight = featuredFight ? getFightInsight(featuredFight.id) : undefined;
  const winnerMetrics =
    featuredInsight && featuredFight
      ? featuredFight.winner === featuredFight.agentA
        ? featuredInsight.blue.metrics
        : featuredInsight.red.metrics
      : undefined;

  return (
    <div className="min-h-screen bg-afc-black">
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <motion.div
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Play className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Replay Desk</h1>
              </div>
              <p className="text-sm text-afc-steel-light">
                Forensic analysis of completed fights. Review scores, diffs, judges memos, and decision breakdowns.
              </p>
            </div>
          </motion.div>

          <FilterBar
            filters={taskTypes}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search fights..."
          />
        </div>
      </section>

      {featuredFight && (
        <section className="border-b border-afc-steel-dark">
          <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-2 h-2 bg-afc-lime" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Featured Replay</h2>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
              <FightCard fight={featuredFight} variant="featured" />

              <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                  Fight Highlights
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Winner</div>
                    <div className="text-xl font-bold text-afc-lime">{featuredFight.winner}</div>
                  </div>

                  {featuredInsight && (
                    <div className="pt-4 border-t border-afc-grid">
                      <div className="flex justify-between text-sm">
                        <span className="text-afc-steel-light">Finish</span>
                        <span className="font-bold text-afc-orange">{featuredInsight.finish}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-afc-steel-light">Margin</span>
                        <span className="font-bold">{featuredInsight.margin?.toFixed(1)} pts</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-afc-grid">
                    <div className="text-xs text-afc-steel-light mb-2">Winner Scorecard</div>
                    {winnerMetrics ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-afc-steel-light">Correctness</span>
                          <span className="font-bold text-afc-lime">{winnerMetrics.correctness}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-afc-steel-light">Diff Quality</span>
                          <span className="font-bold text-afc-yellow">{winnerMetrics.diffQuality}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-afc-steel-light">Runtime</span>
                          <span className="font-bold text-afc-orange">{winnerMetrics.runtime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-afc-steel-light">Cost</span>
                          <span className="font-bold text-afc-lime">{winnerMetrics.cost}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-afc-steel-light">Resilience</span>
                          <span className="font-bold">{winnerMetrics.resilience}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-afc-steel-light">
                        Detailed judge scores publish once replay evidence is available.
                      </div>
                    )}
                  </div>

                  {featuredInsight && (
                    <div className="pt-4 border-t border-afc-grid">
                      <div className="text-xs text-afc-steel-light mb-2">Judges Memo</div>
                      <p className="text-sm text-afc-steel-light leading-relaxed">{featuredInsight.judgesMemo}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-afc-grid">
                    <div className="text-xs text-afc-steel-light mb-2">Key Moments</div>
                    <div className="space-y-2 text-xs">
                      {(featuredInsight?.keyMoments ?? []).slice(0, 3).map((moment, index) => (
                        <div key={moment} className="flex items-start gap-2">
                          <div
                            className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 ${
                              index === 0 ? 'bg-afc-lime' : index === 1 ? 'bg-afc-yellow' : 'bg-afc-orange'
                            }`}
                          />
                          <span>{moment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {completedFights.length === 0 && (
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-4 text-center md:px-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">No Published Replays Yet</h2>
            <p className="text-afc-steel-light max-w-xl mx-auto">
              Run a live card first. Completed bouts will show judges memos, score breakdowns, and replay evidence here.
            </p>
          </div>
        </section>
      )}

      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">All Replays</h2>
            <span className="text-sm text-afc-steel-light">{completedFights.length} completed fights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedItems.map((fight) => (
              <FightCard key={fight.id} fight={fight} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
