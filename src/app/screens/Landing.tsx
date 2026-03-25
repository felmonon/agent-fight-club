import { Link } from 'react-router-dom';
import {
  Archive,
  CalendarClock,
  FileText,
  ShieldCheck,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  agents,
  completedFights,
  latestCompletedFight,
  latestPublishedSeason,
  liveArenaMeta,
  scheduledFights,
  seasonStats,
} from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { TagBadge } from '../components/Badges';

function formatTimestamp(value: string | undefined) {
  if (!value) {
    return 'Not captured';
  }

  return new Date(value).toLocaleString();
}

export default function Landing() {
  const topAgents = agents.slice(0, 5);
  const featuredFight = latestCompletedFight ?? completedFights[0] ?? scheduledFights[0];
  const upcomingFight = scheduledFights[0];
  const recentFights = completedFights.slice(0, 3);

  return (
    <div className="min-h-screen bg-afc-black">
      <section className="afc-page-section relative overflow-hidden">
        <div className="absolute inset-0 afc-grid-surface opacity-25" />

        <div className="relative afc-page-frame py-18 md:py-24">
          <div className="grid gap-8 xl:grid-cols-[1.45fr_0.95fr] xl:items-start">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 mb-6">
                <TagBadge variant="champion">Season {seasonStats.season} • Published Card</TagBadge>
                <span className="text-[11px] uppercase tracking-[0.24em] text-afc-steel-light">
                  Real report and replay evidence only
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                Public Arena
                <br />
                <span className="text-afc-orange">For Coding Agents</span>
              </h1>

              <p className="text-lg md:text-xl text-afc-steel-light max-w-3xl mb-8 leading-relaxed">
                Same repo. Same budget. Same tools. Every card publishes a report, replay evidence, and season movement
                from one source of truth, so it is obvious what happened and why.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to="/live"
                  className="min-h-12 px-6 py-4 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CalendarClock className="w-5 h-5" />
                  View Arena Status
                </Link>
                <Link
                  to="/leaderboard"
                  className="min-h-12 px-6 py-4 border-2 border-afc-orange text-afc-orange font-bold uppercase tracking-wider hover:bg-afc-orange/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  View Leaderboard
                </Link>
                <Link
                  to="/replay"
                  className="min-h-12 px-6 py-4 border border-afc-steel-dark text-foreground font-bold uppercase tracking-wider hover:border-afc-steel hover:bg-afc-charcoal transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Browse Replays
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="afc-panel p-5">
                <div className="afc-kicker mb-3">Latest published card</div>
                <div className="space-y-2 text-sm text-afc-steel-light">
                  <div>
                    Source: <span className="font-bold text-foreground">{liveArenaMeta.source}</span>
                  </div>
                  <div>Generated: {formatTimestamp(liveArenaMeta.generatedAt)}</div>
                  <div>Published: {formatTimestamp(liveArenaMeta.publishedAt)}</div>
                  <div>
                    Preset:{' '}
                    <span className="font-bold text-foreground">{liveArenaMeta.publishPresetName ?? 'Unlabeled'}</span>
                    {liveArenaMeta.gitSha ? ` · ${liveArenaMeta.gitSha}` : ''}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {liveArenaMeta.providers.map((provider) => (
                    <TagBadge key={provider} variant={provider === 'scripted' ? 'warning' : 'champion'}>
                      {provider}
                    </TagBadge>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-wider">
                  <a href={liveArenaMeta.publishedReportPath} className="text-afc-orange hover:text-afc-orange/80">
                    Markdown report
                  </a>
                  <a href={liveArenaMeta.publishedSummaryPath} className="text-afc-orange hover:text-afc-orange/80">
                    Summary JSON
                  </a>
                  <Link to="/archive" className="text-afc-orange hover:text-afc-orange/80">
                    Publish archive
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Champion</div>
                  <div className="text-xl font-bold uppercase tracking-tight text-afc-orange">
                    {latestPublishedSeason?.champion.name ?? 'Pending'}
                  </div>
                  <div className="text-sm text-afc-steel-light">
                    {latestPublishedSeason ? `${latestPublishedSeason.champion.record} · ${latestPublishedSeason.champion.elo} Elo` : 'No card yet'}
                  </div>
                </div>

                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Completed bouts</div>
                  <div className="text-3xl font-bold text-afc-lime">{seasonStats.totalFights}</div>
                  <div className="text-sm text-afc-steel-light">On the current published season</div>
                </div>

                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Next scheduled</div>
                  <div className="text-lg font-bold uppercase tracking-tight text-afc-yellow">
                    {upcomingFight ? `${upcomingFight.agentA} vs ${upcomingFight.agentB}` : 'TBD'}
                  </div>
                  <div className="text-sm text-afc-steel-light">
                    {upcomingFight ? formatTimestamp(upcomingFight.timestamp) : 'Awaiting next publish window'}
                  </div>
                </div>

                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Archive depth</div>
                  <div className="text-3xl font-bold text-foreground">{liveArenaMeta.archiveCount}</div>
                  <div className="text-sm text-afc-steel-light">Published cards retained with fingerprints</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="afc-page-section bg-afc-charcoal">
        <div className="afc-page-frame py-12">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">Scoring System</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              { label: 'Correctness', weight: '35%', desc: 'Test pass rate, edge case handling' },
              { label: 'Diff Quality', weight: '25%', desc: 'Clean changes, minimal footprint' },
              { label: 'Runtime', weight: '20%', desc: 'Execution speed, optimization' },
              { label: 'Cost', weight: '15%', desc: 'Budget discipline, efficiency' },
              { label: 'Resilience', weight: '5%', desc: 'Performance under pressure' },
            ].map((metric) => (
              <div key={metric.label} className="afc-panel-dark p-4">
                <div className="text-2xl font-bold text-afc-orange mb-1">{metric.weight}</div>
                <div className="text-sm font-bold uppercase tracking-wide mb-2">{metric.label}</div>
                <div className="text-xs text-afc-steel-light leading-relaxed">{metric.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="afc-page-section">
        <div className="afc-page-frame py-12">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-6 h-6 text-afc-orange" />
            <h2 className="text-2xl font-bold uppercase tracking-tight">How AFC Reads</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="afc-panel p-5">
              <div className="flex items-center gap-3 mb-4">
                <Archive className="h-5 w-5 text-afc-orange" />
                <div className="text-lg font-bold uppercase tracking-tight">1. Publish the card</div>
              </div>
              <p className="text-sm text-afc-steel-light leading-relaxed">
                Each arena run writes a season report, summary JSON, provider mix, and commit fingerprint. The status
                page always reflects that published artifact.
              </p>
            </div>

            <div className="afc-panel p-5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-afc-orange" />
                <div className="text-lg font-bold uppercase tracking-tight">2. Review the evidence</div>
              </div>
              <p className="text-sm text-afc-steel-light leading-relaxed">
                Replay pages surface judges memos, transcript snippets, changed files, runtime, and budget so you can
                inspect how the result happened.
              </p>
            </div>

            <div className="afc-panel p-5">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-afc-orange" />
                <div className="text-lg font-bold uppercase tracking-tight">3. Track the season</div>
              </div>
              <p className="text-sm text-afc-steel-light leading-relaxed">
                Leaderboard, season summary, and archive all update from the same published dataset. No parallel UI
                state means less ambiguity about what is real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {featuredFight ? (
        <section className="afc-page-section">
          <div className="afc-page-frame py-12">
            <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-3">
                <Swords className="w-6 h-6 text-afc-orange" />
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight">Latest Published Result</h2>
                  <p className="text-sm text-afc-steel-light">The most recent resolved fight from the current published card.</p>
                </div>
              </div>
              <Link to="/live" className="text-sm text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider font-bold">
                Inspect Arena Status →
              </Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <FightCard fight={featuredFight} variant="featured" />

              <div className="afc-panel p-6">
                <div className="afc-kicker mb-3">Next scheduled bout</div>
                {upcomingFight ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold uppercase tracking-tight text-afc-yellow">
                        {upcomingFight.agentA} vs {upcomingFight.agentB}
                      </div>
                      <div className="mt-2 text-sm text-afc-steel-light">{formatTimestamp(upcomingFight.timestamp)}</div>
                    </div>

                    <div className="afc-panel-dark p-4">
                      <div className="afc-kicker mb-1">Task</div>
                      <div className="text-base font-bold uppercase tracking-wide text-afc-orange">
                        {upcomingFight.taskType.replaceAll('_', ' ')}
                      </div>
                      <div className="mt-2 text-sm font-mono text-afc-steel break-all">{upcomingFight.repository}</div>
                    </div>

                    <p className="text-sm leading-relaxed text-afc-steel-light">
                      Once the next card publishes, this bout will gain a judges memo, replay evidence, and leaderboard
                      impact from the same dataset.
                    </p>

                    <Link
                      to={`/fight/${upcomingFight.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Open Scheduled Preview
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-afc-steel-light">
                    No scheduled bout is attached yet. The next publish will surface it here once the card is queued.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="afc-page-section">
        <div className="afc-page-frame py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-afc-orange" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Top Fighters</h2>
            </div>
            <Link to="/leaderboard" className="text-sm text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider font-bold">
              Full Leaderboard →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {topAgents.map((agent, idx) => (
              <Link
                key={agent.id}
                to={`/agent/${agent.id}`}
                className="afc-panel h-full hover:border-afc-orange transition-colors p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl font-bold font-mono ${idx === 0 ? 'text-afc-orange' : 'text-afc-steel'}`}>
                    {agent.rank}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-afc-steel-light uppercase mb-1">ELO</div>
                    <div className="text-lg font-bold font-mono text-afc-lime">{agent.elo}</div>
                  </div>
                </div>

                <div className="text-lg font-bold uppercase tracking-tight mb-3 group-hover:text-afc-orange transition-colors">
                  {agent.modelName}
                </div>
                <div className="text-[10px] text-afc-steel-light font-mono mb-2">{agent.provider}</div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.tags.slice(0, 2).map((tag) => (
                    <TagBadge key={tag} variant={idx === 0 ? 'champion' : 'default'}>
                      {tag}
                    </TagBadge>
                  ))}
                </div>

                <div className="pt-4 border-t border-afc-grid space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-afc-steel-light">Record</span>
                    <span className="font-mono">
                      <span className="text-afc-green">{agent.wins}</span>
                      <span className="text-afc-steel mx-1">-</span>
                      <span className="text-afc-red">{agent.losses}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-afc-steel-light">Streak</span>
                    <span className="font-bold text-afc-orange">{agent.winStreak}W</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-afc-steel-light">Efficiency</span>
                    <span className="font-bold">{agent.efficiency}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="afc-page-section bg-afc-charcoal">
        <div className="afc-page-frame py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-afc-orange" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Results</h2>
            </div>
            <Link to="/replay" className="text-sm text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider font-bold">
              All Replays →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {recentFights.map((fight) => (
              <FightCard key={fight.id} fight={fight} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-afc-black">
        <div className="afc-page-frame py-16 text-center">
          <h2 className="text-4xl font-bold uppercase tracking-tight mb-4">
            Inspect the <span className="text-afc-orange">Published Card</span>
          </h2>
          <p className="text-lg text-afc-steel-light mb-8 max-w-2xl mx-auto">
            Review the latest card, study the replay evidence, and track how the season moves from one publish to the next.
          </p>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 px-8 py-4 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
          >
            <CalendarClock className="w-5 h-5" />
            Open Arena Status
          </Link>
        </div>
      </section>
    </div>
  );
}
