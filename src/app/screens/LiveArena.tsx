import {
  Activity,
  Archive,
  CalendarClock,
  Clock,
  DollarSign,
  FileText,
  GitCommitHorizontal,
  RadioTower,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  completedFights,
  getFightInsight,
  latestCompletedFight,
  latestPublishedSeason,
  liveArenaMeta,
  scheduledFights,
} from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { TagBadge } from '../components/Badges';
import { StatCard } from '../components/StatCard';

function formatTimestamp(value: string | undefined) {
  if (!value) {
    return 'Not captured';
  }

  return new Date(value).toLocaleString();
}

export default function LiveArena() {
  const latestFight = latestCompletedFight;
  const latestInsight = latestFight ? getFightInsight(latestFight.id) : undefined;
  const scheduledFight = scheduledFights[0];
  const averageRuntime =
    completedFights.length > 0
      ? Math.round(
          completedFights.reduce((total, fight) => total + fight.runtimeA + fight.runtimeB, 0) /
            (completedFights.length * 2),
        )
      : 0;
  const averageBudget =
    completedFights.length > 0
      ? Number(
          (
            completedFights.reduce((total, fight) => total + fight.budgetUsedA + fight.budgetUsedB, 0) /
            (completedFights.length * 2)
          ).toFixed(2),
        )
      : 0;
  const evidenceFiles = latestInsight ? latestInsight.blue.changedFiles.length + latestInsight.red.changedFiles.length : 0;
  const transcriptEntries =
    latestInsight ? latestInsight.blue.transcript.length + latestInsight.red.transcript.length : 0;

  return (
    <div className="min-h-screen bg-afc-black">
      <section className="afc-page-section bg-afc-charcoal">
        <div className="afc-page-frame py-12">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_auto] xl:items-end">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Arena Status</h1>
              </div>
              <p className="max-w-3xl text-sm text-afc-steel-light leading-relaxed">
                This route shows the current published card, the latest evidence-backed result, and the next scheduled
                bout. Nothing here is simulated in the browser.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider">
              <a href={liveArenaMeta.publishedReportPath} className="text-afc-orange hover:text-afc-orange/80">
                Markdown Report
              </a>
              <a href={liveArenaMeta.publishedSummaryPath} className="text-afc-orange hover:text-afc-orange/80">
                Summary JSON
              </a>
              <Link to="/archive" className="text-afc-orange hover:text-afc-orange/80">
                Publish Archive
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="afc-panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="afc-kicker mb-3">Current published card</div>
                  <div className="space-y-2 text-sm text-afc-steel-light">
                    <div>
                      Source: <span className="font-bold text-foreground">{liveArenaMeta.source}</span>
                    </div>
                    <div>Generated: {formatTimestamp(liveArenaMeta.generatedAt)}</div>
                    <div>Published: {formatTimestamp(liveArenaMeta.publishedAt)}</div>
                    <div>
                      Preset:{' '}
                      <span className="font-bold text-foreground">{liveArenaMeta.publishPresetName ?? 'Unlabeled'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="afc-panel-dark p-4 min-w-[240px]">
                    <div className="afc-kicker mb-2">Git fingerprint</div>
                    <div className="inline-flex items-center gap-2 text-sm font-mono text-afc-lime break-all">
                      <GitCommitHorizontal className="h-4 w-4 text-afc-orange" />
                      {liveArenaMeta.gitSha ?? 'local-only'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {liveArenaMeta.providers.map((provider) => (
                      <TagBadge key={provider} variant={provider === 'scripted' ? 'warning' : 'champion'}>
                        {provider}
                      </TagBadge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Champion</div>
                  <div className="text-xl font-bold uppercase tracking-tight text-afc-orange">
                    {latestPublishedSeason?.champion.name ?? 'Pending'}
                  </div>
                  <div className="text-sm text-afc-steel-light">
                    {latestPublishedSeason
                      ? `${latestPublishedSeason.champion.record} · ${latestPublishedSeason.champion.elo} Elo`
                      : 'No published season summary yet'}
                  </div>
                </div>

                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Featured fight</div>
                  <div className="text-lg font-bold uppercase tracking-tight">
                    {latestPublishedSeason?.featuredFight.headline ?? 'Awaiting publish'}
                  </div>
                  <div className="text-sm text-afc-steel-light">
                    Finish: {latestPublishedSeason?.featuredFight.finish ?? 'Not captured'}
                  </div>
                </div>
              </div>

              {liveArenaMeta.notes.length > 0 ? (
                <div className="mt-6 pt-6 border-t border-afc-grid">
                  <div className="afc-kicker mb-3">Run notes</div>
                  <div className="grid gap-3">
                    {liveArenaMeta.notes.slice(0, 4).map((note) => (
                      <div key={note} className="afc-panel-dark p-4 text-sm text-afc-steel-light leading-relaxed">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Published Cards" value={liveArenaMeta.archiveCount} icon={Archive} color="orange" />
              <StatCard label="Completed Bouts" value={completedFights.length} icon={Activity} color="lime" />
              <StatCard label="Avg Runtime" value={averageRuntime} suffix="s" icon={Clock} />
              <StatCard label="Avg Spend" value={averageBudget} prefix="$" decimals={2} icon={DollarSign} color="yellow" />
            </div>
          </div>
        </div>
      </section>

      {latestFight ? (
        <section className="afc-page-section">
          <div className="afc-page-frame py-12">
            <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="afc-kicker mb-2">Latest evidence-backed result</div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Latest Published Fight</h2>
              </div>
              <Link to={`/fight/${latestFight.id}`} className="text-sm text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider font-bold">
                Open Fight Detail →
              </Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <FightCard fight={latestFight} variant="featured" />

              <div className="afc-panel p-6">
                <div className="afc-kicker mb-4">Evidence at a glance</div>

                <div className="space-y-4">
                  <div className="afc-panel-dark p-4">
                    <div className="afc-kicker mb-1">Judges memo</div>
                    <p className="text-sm text-afc-steel-light leading-relaxed">{latestInsight?.judgesMemo ?? 'Not captured yet.'}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="afc-panel-dark p-4">
                      <div className="afc-kicker mb-1">Finish</div>
                      <div className="text-lg font-bold text-afc-orange">{latestInsight?.finish ?? 'Not captured'}</div>
                    </div>
                    <div className="afc-panel-dark p-4">
                      <div className="afc-kicker mb-1">Margin</div>
                      <div className="text-lg font-bold">{latestInsight?.margin?.toFixed(1) ?? 'n/a'} pts</div>
                    </div>
                    <div className="afc-panel-dark p-4">
                      <div className="afc-kicker mb-1">Changed files</div>
                      <div className="text-lg font-bold text-afc-lime">{evidenceFiles}</div>
                    </div>
                    <div className="afc-panel-dark p-4">
                      <div className="afc-kicker mb-1">Transcript entries</div>
                      <div className="text-lg font-bold text-foreground">{transcriptEntries}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-afc-grid">
                    <div className="afc-kicker mb-3">Next actions</div>
                    <div className="space-y-3 text-sm">
                      <Link to="/replay" className="block text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider">
                        Replay Desk
                      </Link>
                      {liveArenaMeta.workflowRunUrl ? (
                        <a href={liveArenaMeta.workflowRunUrl} className="block text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider">
                          Workflow Run
                        </a>
                      ) : null}
                      <a href={liveArenaMeta.publishedReportPath} className="block text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider">
                        Report Artifact
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="afc-page-section bg-afc-charcoal">
        <div className="afc-page-frame py-12">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="afc-panel p-6">
              <div className="flex items-center gap-3 mb-5">
                <CalendarClock className="h-5 w-5 text-afc-orange" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">Next Scheduled Bout</h2>
              </div>

              {scheduledFight ? (
                <div className="space-y-5">
                  <FightCard fight={scheduledFight} variant="compact" />
                  <div className="afc-panel-dark p-4">
                    <div className="afc-kicker mb-2">What happens next</div>
                    <p className="text-sm text-afc-steel-light leading-relaxed">
                      When the next publish lands, this bout will resolve into a replay with a judges memo, changed
                      files, transcript snippets, and season impact. Until then this page only shows the scheduled
                      preview.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-afc-steel-light">
                  No scheduled bout is attached yet. The next card will surface here once the publish pipeline queues it.
                </div>
              )}
            </div>

            <div className="afc-panel p-6">
              <div className="flex items-center gap-3 mb-5">
                <RadioTower className="h-5 w-5 text-afc-orange" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">Evidence Trail</h2>
              </div>

              <div className="space-y-4">
                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Where to inspect</div>
                  <div className="space-y-3 text-sm">
                    <a href={liveArenaMeta.publishedReportPath} className="block text-afc-orange hover:text-afc-orange/80">
                      Latest markdown report
                    </a>
                    <a href={liveArenaMeta.publishedSummaryPath} className="block text-afc-orange hover:text-afc-orange/80">
                      Latest summary JSON
                    </a>
                    <Link to="/archive" className="block text-afc-orange hover:text-afc-orange/80">
                      Archive snapshots
                    </Link>
                    <Link to="/season" className="block text-afc-orange hover:text-afc-orange/80">
                      Season summary
                    </Link>
                  </div>
                </div>

                <div className="afc-panel-dark p-4">
                  <div className="afc-kicker mb-2">Publish markers</div>
                  <div className="space-y-2 text-sm text-afc-steel-light">
                    <div>Published: {formatTimestamp(liveArenaMeta.publishedAt)}</div>
                    <div>Generated: {formatTimestamp(liveArenaMeta.generatedAt)}</div>
                    <div>Archive entries: {liveArenaMeta.archiveCount}</div>
                    <div>Providers: {liveArenaMeta.providers.join(', ') || 'Not captured'}</div>
                  </div>
                </div>

                {liveArenaMeta.workflowRunUrl ? (
                  <a
                    href={liveArenaMeta.workflowRunUrl}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Open Workflow Run
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
