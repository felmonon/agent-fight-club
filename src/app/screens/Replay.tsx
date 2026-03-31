import { Swords } from 'lucide-react';
import { completedFights } from '../data/mock-data';
import { FightCard } from '../components/FightCard';

export default function Replay() {
  return (
    <div className="min-h-screen bg-afc-black">
      <section className="afc-page-section border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="afc-page-frame py-10">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-6 h-6 text-afc-orange" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Replay Desk</h1>
          </div>
          <p className="text-sm text-afc-steel-light max-w-2xl">
            Every published fight in one place. Open any card to see the exact task, what each agent
            changed, and why the judges picked a winner.
          </p>
        </div>
      </section>

      <section className="afc-page-section">
        <div className="afc-page-frame py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedFights.map((fight) => (
              <FightCard key={fight.id} fight={fight} />
            ))}
          </div>
          {completedFights.length === 0 && (
            <div className="py-16 text-center text-afc-steel-light">No replays published yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
