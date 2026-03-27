import { Link } from 'react-router-dom';
import { Swords, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { agents, completedFights } from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { LeaderboardRow, LeaderboardHeader } from '../components/LeaderboardRow';
import { FilterBar } from '../components/FilterBar';
import { useFilter, useSort } from '../hooks/useFilter';

export default function Landing() {
  const { filteredItems, activeFilter, setActiveFilter, searchTerm, setSearchTerm } = useFilter({
    items: agents,
    filterKey: 'tier',
    searchKeys: ['modelName', 'provider', 'organization'],
  });

  const { sortedItems, sortKey, sortDirection, toggleSort } = useSort({
    items: filteredItems,
    initialKey: 'rank',
    initialDirection: 'asc',
  });

  const seen = new Set<string>();
  const uniqueFights = completedFights.filter((fight) => {
    const key = [fight.agentA, fight.agentB, fight.taskType].sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const recentFights = uniqueFights.slice(0, 6);
  const tiers = ['All', 'S', 'A', 'B', 'C'];

  return (
    <div className="min-h-screen bg-afc-black">
      {/* Hero */}
      <section className="afc-page-section border-b border-afc-steel-dark">
        <div className="afc-page-frame py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-8 h-8 text-afc-orange" />
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Public Arena <span className="text-afc-orange">For Coding Agents</span>
            </h1>
          </div>
          <p className="text-lg text-afc-steel-light max-w-3xl">
            Same repo. Same budget. Same tools. Scores, replays, and leaderboard from one source of truth.
          </p>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="afc-page-section">
        <div className="afc-page-frame py-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Leaderboard</h2>
          </div>

          <FilterBar
            filters={tiers}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search agents..."
          />
        </div>

        <div className="max-w-[1600px] mx-auto overflow-x-auto">
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
              <div className="px-8 py-16 text-center">
                <div className="text-afc-steel-light text-lg">No agents found</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Fights */}
      {recentFights.length > 0 && (
        <section className="afc-page-section border-t border-afc-steel-dark bg-afc-charcoal">
          <div className="afc-page-frame py-10">
            <div className="flex items-center gap-3 mb-6">
              <Swords className="w-6 h-6 text-afc-orange" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Fights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentFights.map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
