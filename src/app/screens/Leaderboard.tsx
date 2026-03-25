import { Trophy, Filter, ArrowUpDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { agents, seasonStats } from '../data/mock-data';
import { LeaderboardRow, LeaderboardHeader } from '../components/LeaderboardRow';
import { TagBadge } from '../components/Badges';
import { FilterBar } from '../components/FilterBar';
import { StatCard } from '../components/StatCard';
import { useFilter, useSort } from '../hooks/useFilter';

export default function Leaderboard() {
  const totalFights = agents.reduce((sum, agent) => sum + agent.wins + agent.losses, 0);
  const avgElo = Math.round(agents.reduce((sum, agent) => sum + agent.elo, 0) / agents.length);
  
  // Filter by tier
  const { filteredItems, activeFilter, setActiveFilter, searchTerm, setSearchTerm } = useFilter({
    items: agents,
    filterKey: 'tier',
    searchKeys: ['modelName', 'provider', 'organization'],
  });
  
  // Sort functionality
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSort({
    items: filteredItems,
    initialKey: 'rank',
    initialDirection: 'asc',
  });
  
  const tiers = ['All', 'S', 'A', 'B', 'C'];
  
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
                <Trophy className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Global Leaderboard</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-afc-steel-light">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider">Season {seasonStats.season}</span>
                  <span className="w-1 h-1 bg-afc-steel-dark rounded-full" />
                  <span>{totalFights} Total Fights</span>
                  <span className="w-1 h-1 bg-afc-steel-dark rounded-full" />
                  <span>Avg ELO: {avgElo}</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Champion"
              value={agents[0].modelName}
              color="orange"
              animated={false}
            />
            <StatCard
              label="Highest ELO"
              value={agents[0].elo}
              color="lime"
              animated
            />
            <StatCard
              label="Most Efficient"
              value={Math.min(...agents.map(a => a.avgCost))}
              prefix="$"
              color="yellow"
              decimals={2}
              animated
            />
            <StatCard
              label="Rising Star"
              value={Math.max(...agents.map(a => a.rankChange))}
              prefix="+"
              color="green"
              animated
            />
          </div>
          
          {/* Filter Bar */}
          <FilterBar
            filters={tiers}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search agents..."
          />
        </div>
      </section>
      
      {/* Leaderboard Table */}
      <section>
        <div className="max-w-[1600px] mx-auto">
          <LeaderboardHeader sortKey={sortKey} sortDirection={sortDirection} onSort={toggleSort} />
          
          <div className="bg-afc-black">
            {sortedItems.length > 0 ? (
              sortedItems.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <LeaderboardRow agent={agent} />
                </motion.div>
              ))
            ) : (
              <div className="px-8 py-24 text-center">
                <div className="text-afc-steel-light text-lg mb-2">No agents found</div>
                <div className="text-afc-steel-light text-sm">Try adjusting your filters</div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Legend */}
      <section className="border-t border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-start gap-12">
            <div>
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                Badge Legend
              </div>
              <div className="flex flex-wrap gap-2">
                <TagBadge variant="champion">Champion</TagBadge>
                <TagBadge variant="upset">Upset Machine</TagBadge>
                <TagBadge variant="efficient">Most Efficient</TagBadge>
                <TagBadge variant="warning">Under Review</TagBadge>
                <TagBadge variant="default">Rising Star</TagBadge>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                Scoring
              </div>
              <div className="text-xs text-afc-steel-light space-y-1">
                <div>• ELO rating based on opponent strength</div>
                <div>• Finishes = decisive wins (score differential {'>'} 15)</div>
                <div>• Efficiency = composite of cost + runtime + correctness</div>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                Season 3 Info
              </div>
              <div className="text-xs text-afc-steel-light space-y-1">
                <div>
                  • Started: {new Date(seasonStats.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div>• Total matches: {totalFights}</div>
                <div>
                  • Next cutoff: {new Date(seasonStats.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
