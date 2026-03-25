import { Archive, Clock3, FileText, GitCommitHorizontal, RadioTower } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { liveArenaMeta, publishedSeasons } from '../data/mock-data';
import { TagBadge } from '../components/Badges';

function formatTimestamp(value: string | undefined) {
  if (!value) {
    return 'Not captured';
  }

  return new Date(value).toLocaleString();
}

export default function ArchiveScreen() {
  return (
    <div className="min-h-screen bg-afc-black">
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <motion.div
            className="grid gap-8 xl:grid-cols-[1.6fr_1fr]"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Archive className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Publish Archive</h1>
              </div>
              <p className="max-w-3xl text-sm text-afc-steel-light leading-relaxed">
                Every published card keeps its own report snapshot, summary manifest, provider mix, and
                commit fingerprint. The latest card is surfaced live, but the archive preserves the trail.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="border border-afc-steel-dark bg-afc-black p-4">
                <div className="text-[10px] uppercase tracking-wider text-afc-steel-light mb-1">Published Cards</div>
                <div className="text-3xl font-bold text-afc-orange">{liveArenaMeta.archiveCount}</div>
              </div>
              <div className="border border-afc-steel-dark bg-afc-black p-4">
                <div className="text-[10px] uppercase tracking-wider text-afc-steel-light mb-1">Latest Preset</div>
                <div className="text-lg font-bold uppercase tracking-wide">
                  {liveArenaMeta.publishPresetName ?? 'Unlabeled'}
                </div>
              </div>
              <div className="border border-afc-steel-dark bg-afc-black p-4">
                <div className="text-[10px] uppercase tracking-wider text-afc-steel-light mb-1">Latest Commit</div>
                <div className="text-lg font-mono text-afc-lime">{liveArenaMeta.gitSha ?? 'local-only'}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-afc-steel-dark">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-afc-steel-light mb-2">
                Latest publish manifest
              </div>
              <div className="text-sm text-afc-steel-light">
                Published: {formatTimestamp(liveArenaMeta.publishedAt)}
              </div>
              <div className="text-sm text-afc-steel-light">
                Generated: {formatTimestamp(liveArenaMeta.generatedAt)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider">
              <a href={liveArenaMeta.publishedReportPath} className="text-afc-orange hover:text-afc-orange/80">
                Latest Markdown
              </a>
              <a href={liveArenaMeta.publishedSummaryPath} className="text-afc-orange hover:text-afc-orange/80">
                Latest Summary
              </a>
              {liveArenaMeta.workflowRunUrl ? (
                <a href={liveArenaMeta.workflowRunUrl} className="text-afc-orange hover:text-afc-orange/80">
                  Workflow Run
                </a>
              ) : null}
              <Link to="/replay" className="text-afc-orange hover:text-afc-orange/80">
                Replay Desk
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {publishedSeasons.map((entry, index) => (
              <motion.article
                key={entry.slug}
                className={`border p-6 ${
                  index === 0
                    ? 'border-afc-orange bg-afc-charcoal glow-orange'
                    : 'border-afc-steel-dark bg-afc-charcoal'
                }`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-afc-steel-light">
                        {index === 0 ? 'Current published card' : 'Archive snapshot'}
                      </div>
                      {entry.providers.map((provider) => (
                        <TagBadge
                          key={`${entry.slug}-${provider}`}
                          variant={provider === 'scripted' ? 'warning' : 'champion'}
                        >
                          {provider}
                        </TagBadge>
                      ))}
                    </div>

                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">{entry.title}</h2>
                    <div className="grid gap-2 text-sm text-afc-steel-light md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-afc-orange" />
                        Published {formatTimestamp(entry.publishedAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioTower className="w-4 h-4 text-afc-orange" />
                        Source {entry.datasetSource} · Report {entry.reportSource}
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommitHorizontal className="w-4 h-4 text-afc-orange" />
                        {entry.gitSha ?? 'No git SHA captured'}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-afc-orange" />
                        {entry.publishPresetName ?? entry.publishPreset ?? 'Manual publish'}
                      </div>
                    </div>

                    <div className="grid gap-4 mt-6 md:grid-cols-2">
                      <div className="border border-afc-grid bg-afc-black/60 p-4">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-afc-steel-light mb-2">
                          Champion
                        </div>
                        <div className="text-xl font-bold text-afc-orange">{entry.champion.name}</div>
                        <div className="text-sm text-afc-steel-light">
                          {entry.champion.record} · {entry.champion.elo} Elo
                        </div>
                      </div>

                      <div className="border border-afc-grid bg-afc-black/60 p-4">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-afc-steel-light mb-2">
                          Featured Fight
                        </div>
                        <div className="text-xl font-bold">{entry.featuredFight.headline}</div>
                        <div className="text-sm text-afc-steel-light">Finish: {entry.featuredFight.finish}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-afc-grid bg-afc-black/60 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-afc-steel-light mb-4">
                      Evidence Links
                    </div>
                    <div className="space-y-3 text-sm">
                      <a href={entry.reportPath} className="block text-afc-orange hover:text-afc-orange/80">
                        Markdown Report
                      </a>
                      <a href={entry.summaryPath} className="block text-afc-orange hover:text-afc-orange/80">
                        Summary JSON
                      </a>
                      <Link to="/season" className="block text-afc-orange hover:text-afc-orange/80">
                        Season Summary
                      </Link>
                      <Link to="/replay" className="block text-afc-orange hover:text-afc-orange/80">
                        Replay Desk
                      </Link>
                      {entry.workflowRunUrl ? (
                        <a href={entry.workflowRunUrl} className="block text-afc-orange hover:text-afc-orange/80">
                          Workflow Run
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
