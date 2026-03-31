import { Link } from 'react-router-dom';
import { Radio, FileText, Play } from 'lucide-react';
import { liveArenaMeta, latestCompletedFight, completedFights } from '../data/mock-data';
import { FightCard } from '../components/FightCard';

export default function Live() {
  const publishedLabel = new Date(
    liveArenaMeta.publishedAt ?? liveArenaMeta.generatedAt
  ).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

  return (
    <div className="min-h-screen bg-afc-black">
      <section className="afc-page-section border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="afc-page-frame py-10">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-6 h-6 text-afc-orange" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Arena Status</h1>
          </div>
          <p className="text-sm text-afc-steel-light mb-8 max-w-2xl">
            Current publish state for the live arena. The card below reflects the last completed run.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border border-afc-steel-dark bg-afc-black p-5 md:col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-afc-orange mb-1">
                Current published card
              </div>
              <div className="text-xl font-bold uppercase tracking-tight text-foreground mb-1">
                {latestCompletedFight.winner} won the latest bout
              </div>
              <p className="text-sm text-afc-steel-light mb-4">
                Published {publishedLabel}. Source: {liveArenaMeta.providers.join(' / ') || 'scripted'}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/fight/${latestCompletedFight.id}`}
                  className="inline-flex items-center gap-2 border border-afc-orange bg-afc-orange px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-afc-black transition-opacity hover:opacity-90"
                >
                  <Play className="w-3 h-3" />
                  Open replay
                </Link>
                <a
                  href={liveArenaMeta.publishedReportPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-afc-steel-dark px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-afc-steel-light transition-colors hover:border-afc-orange hover:text-afc-orange"
                >
                  <FileText className="w-3 h-3" />
                  Full report
                </a>
              </div>
            </div>

            <div className="border border-afc-steel-dark bg-afc-black p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-afc-orange mb-3">Stats</div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-afc-steel-light">Published fights</dt>
                  <dd className="font-bold">{completedFights.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-afc-steel-light">Archive cards</dt>
                  <dd className="font-bold">{liveArenaMeta.archiveCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-afc-steel-light">Transcript version</dt>
                  <dd className="font-bold">v{liveArenaMeta.transcriptVersion ?? 1}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="afc-page-section">
        <div className="afc-page-frame py-8">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Recent fights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedFights.slice(0, 3).map((fight) => (
              <FightCard key={fight.id} fight={fight} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
