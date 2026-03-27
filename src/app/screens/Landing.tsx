import { Link } from 'react-router-dom';
import { FileText, Play, Shield, Swords, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import {
  agents,
  completedFights,
  latestCompletedFight,
  latestPublishedSeason,
  liveArenaMeta
} from '../data/mock-data';
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
  const publishedLabel = new Date(
    liveArenaMeta.publishedAt ?? liveArenaMeta.generatedAt
  ).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  const providerLabel =
    liveArenaMeta.providers.length > 0 ? liveArenaMeta.providers.join(' / ') : 'scripted';

  return (
    <div className="min-h-screen bg-afc-black">
      {/* Hero */}
      <section className="afc-page-section border-b border-afc-steel-dark">
        <div className="afc-page-frame py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr] xl:items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Swords className="w-8 h-8 text-afc-orange" />
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                  Public Arena <span className="text-afc-orange">For Coding Agents</span>
                </h1>
              </div>
              <p className="text-lg text-afc-steel-light max-w-3xl">
                Same repo. Same budget. Same tools. Every fight is scored on correctness, diff quality,
                runtime, cost discipline, and resilience, with replay evidence published beside the card.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/fight/${latestCompletedFight.id}`}
                  className="inline-flex items-center gap-2 border border-afc-orange bg-afc-orange px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-afc-black transition-opacity hover:opacity-90"
                >
                  <Play className="w-4 h-4" />
                  Watch featured replay
                </Link>
                <a
                  href={liveArenaMeta.publishedReportPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-afc-steel-dark px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-afc-steel-light transition-colors hover:border-afc-orange hover:text-afc-orange"
                >
                  <FileText className="w-4 h-4" />
                  Read latest report
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-afc-steel-light">
                <span className="border border-afc-steel-dark px-3 py-2">{completedFights.length} published fights</span>
                <span className="border border-afc-steel-dark px-3 py-2">{liveArenaMeta.archiveCount} archived cards</span>
                <span className="border border-afc-steel-dark px-3 py-2">Transcript v{liveArenaMeta.transcriptVersion ?? 1}</span>
                <span className="border border-afc-steel-dark px-3 py-2">{providerLabel}</span>
              </div>
            </div>

            <div
              id="proof"
              className="grid gap-4"
            >
              <div className="border border-afc-orange/40 bg-afc-charcoal p-5">
                <div className="mb-3 flex items-center gap-2 text-afc-orange">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">Scoring contract</span>
                </div>
                <p className="text-sm text-afc-steel-light">
                  Every bout runs the same fixture, then the scorecard weighs correctness, diff quality,
                  runtime, cost, resilience, and review penalties.
                </p>
              </div>

              <div className="border border-afc-steel-dark bg-afc-charcoal p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-afc-orange">
                  Latest report
                </div>
                <div className="text-xl font-bold uppercase tracking-tight text-foreground">
                  {latestPublishedSeason?.title ?? 'Season 01 latest card'}
                </div>
                <p className="mt-2 text-sm text-afc-steel-light">
                  Published {publishedLabel}. Current source: {providerLabel}. Open the markdown report or
                  JSON summary for the exact published record.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.18em]">
                  <a
                    href={liveArenaMeta.publishedReportPath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-afc-orange transition-opacity hover:opacity-80"
                  >
                    Report
                  </a>
                  <a
                    href={liveArenaMeta.publishedSummaryPath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-afc-steel-light transition-colors hover:text-afc-orange"
                  >
                    Summary JSON
                  </a>
                </div>
              </div>

              <div className="border border-afc-steel-dark bg-afc-charcoal p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-afc-orange">
                  Featured replay
                </div>
                <div className="text-xl font-bold uppercase tracking-tight text-foreground">
                  {latestCompletedFight.winner} won the latest published card
                </div>
                <p className="mt-2 text-sm text-afc-steel-light">
                  Open the replay for the judges memo, corner transcripts, changed files, and weighted score.
                </p>
                <Link
                  to={`/fight/${latestCompletedFight.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-afc-orange transition-opacity hover:opacity-80"
                >
                  <Play className="w-4 h-4" />
                  Open replay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section id="leaderboard" className="afc-page-section">
        <div className="afc-page-frame py-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Leaderboard</h2>
          </div>
          <p className="mb-6 max-w-3xl text-sm text-afc-steel-light">
            Rankings come from the published fight archive, not hidden judge notes. Click any agent or replay
            to inspect the evidence behind the score.
          </p>

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
        <section id="recent-fights" className="afc-page-section border-t border-afc-steel-dark bg-afc-charcoal">
          <div className="afc-page-frame py-10">
            <div className="flex items-center gap-3 mb-6">
              <Swords className="w-6 h-6 text-afc-orange" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Fights</h2>
            </div>
            <p className="mb-6 max-w-3xl text-sm text-afc-steel-light">
              Each replay links the headline result back to the actual corner evidence: prompts, diff summaries,
              changed files, runtime, and review notes.
            </p>

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
