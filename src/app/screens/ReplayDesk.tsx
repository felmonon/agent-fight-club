import { Play, Calendar, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { fights } from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { FilterBar } from '../components/FilterBar';
import { useFilter, useSort } from '../hooks/useFilter';

export default function ReplayDesk() {
  const completedFights = fights.filter(f => f.status === 'completed');
  const taskTypes = ['All', ...Array.from(new Set(completedFights.map((fight) => fight.taskType.replaceAll('_', ' '))))];
  
  // Filter and sort
  const { filteredItems, activeFilter, setActiveFilter, searchTerm, setSearchTerm } = useFilter({
    items: completedFights,
    filterKey: 'taskType',
    searchKeys: ['agentA', 'agentB'],
  });
  
  const { sortedItems } = useSort({
    items: filteredItems,
    initialKey: 'id',
    initialDirection: 'desc',
  });
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Header */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Play className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Replay Desk</h1>
              </div>
              <p className="text-sm text-afc-steel-light">
                Forensic analysis of completed fights. Review scores, diffs, and decision breakdowns.
              </p>
            </div>
          </motion.div>
          
          {/* Filter Bar */}
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
      
      {/* Featured Replay */}
      {sortedItems.length > 0 && (
        <section className="border-b border-afc-steel-dark">
          <div className="max-w-[1600px] mx-auto px-8 py-12">
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-2 h-2 bg-afc-lime" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Featured Replay</h2>
            </motion.div>
            
            <div className="grid grid-cols-[2fr_1fr] gap-6">
              <FightCard fight={sortedItems[0]} variant="featured" />
              
              {/* Quick Stats Panel */}
              <div className="border border-afc-steel-dark bg-afc-charcoal p-6">
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-4 font-bold">
                  Fight Highlights
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-afc-steel-light mb-1">Winner</div>
                    <div className="text-xl font-bold text-afc-lime">{sortedItems[0].winner}</div>
                  </div>
                  
                  <div className="pt-4 border-t border-afc-grid">
                    <div className="text-xs text-afc-steel-light mb-2">Score Breakdown</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-afc-steel-light">Correctness</span>
                        <span className="font-bold text-afc-lime">95.2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-afc-steel-light">Diff Quality</span>
                        <span className="font-bold text-afc-yellow">88.7</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-afc-steel-light">Runtime</span>
                        <span className="font-bold text-afc-orange">92.1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-afc-steel-light">Cost</span>
                        <span className="font-bold text-afc-lime">96.8</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-afc-steel-light">Resilience</span>
                        <span className="font-bold">89.4</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-afc-grid">
                    <div className="text-xs text-afc-steel-light mb-2">Key Moments</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-afc-lime mt-1.5 flex-shrink-0" />
                        <span>Round 3: Critical optimization unlocked</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-afc-yellow mt-1.5 flex-shrink-0" />
                        <span>Round 4: Edge case handling superior</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-afc-orange mt-1.5 flex-shrink-0" />
                        <span>Round 5: Clean finish under budget</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* All Replays */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight">All Replays</h2>
            <span className="text-sm text-afc-steel-light">
              {completedFights.length} completed fights
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {sortedItems.map((fight) => (
              <FightCard key={fight.id} fight={fight} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
