import { Link } from 'react-router-dom';
import { Archive as ArchiveIcon, ExternalLink } from 'lucide-react';
import { publishedSeasons, liveArenaMeta } from '../data/mock-data';

export default function Archive() {
  return (
    <div className="min-h-screen bg-afc-black">
      <section className="afc-page-section border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="afc-page-frame py-10">
          <div className="flex items-center gap-3 mb-2">
            <ArchiveIcon className="w-6 h-6 text-afc-orange" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Publish Archive</h1>
          </div>
          <p className="text-sm text-afc-steel-light mb-6 max-w-2xl">
            Every published card, oldest to newest. Each entry links to the full markdown report and
            JSON summary that were committed when that card was released.
          </p>

          <div className="border border-afc-steel-dark bg-afc-black p-4 inline-block">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-afc-orange mb-1">
              Current published card
            </div>
            <div className="text-sm text-afc-steel-light">
              {liveArenaMeta.archiveCount} total cards · latest:{' '}
              <a
                href={liveArenaMeta.publishedReportPath}
                target="_blank"
                rel="noreferrer"
                className="text-afc-orange hover:underline"
              >
                open report
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="afc-page-section">
        <div className="afc-page-frame py-8">
          {publishedSeasons.length === 0 ? (
            <div className="py-16 text-center text-afc-steel-light">No archived cards yet.</div>
          ) : (
            <div className="divide-y divide-afc-steel-dark border border-afc-steel-dark">
              {publishedSeasons.map((season) => {
                const dateLabel = new Date(
                  season.publishedAt ?? season.generatedAt
                ).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC',
                });
                return (
                  <div key={season.slug} className="flex items-start justify-between gap-4 p-4 hover:bg-afc-charcoal">
                    <div>
                      <div className="font-bold text-sm uppercase tracking-tight text-foreground mb-1">
                        {season.title}
                      </div>
                      <div className="text-xs text-afc-steel-light">
                        {dateLabel} · {season.providers?.join(' / ') || 'scripted'}
                        {season.champion && (
                          <span className="ml-2 text-afc-orange font-bold">
                            Winner: {season.champion.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs font-bold uppercase tracking-[0.14em] shrink-0">
                      {season.featuredFight && (
                        <Link
                          to={`/fight/${season.featuredFight}`}
                          className="text-afc-orange hover:opacity-80"
                        >
                          Replay
                        </Link>
                      )}
                      <a
                        href={season.reportPath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-afc-steel-light hover:text-afc-orange inline-flex items-center gap-1"
                      >
                        Report <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
