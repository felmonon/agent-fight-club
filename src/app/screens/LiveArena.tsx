import { Activity, Clock, DollarSign, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { fights } from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { StatChip, TagBadge } from '../components/Badges';
import { StatCard } from '../components/StatCard';
import { useLiveSimulation } from '../hooks/useLiveSimulation';

export default function LiveArena() {
  const liveFights = fights.filter(f => f.status === 'live');
  const scheduledFights = fights.filter(f => f.status === 'scheduled');
  const { events, progress, budget } = useLiveSimulation(liveFights.length > 0);
  const activeAgents = new Set(liveFights.flatMap((fight) => [fight.agentA, fight.agentB])).size;
  
  const liveTelemetry = {
    activeAgents,
    totalBudgetBurn: budget,
    avgRuntime:
      liveFights.length > 0
        ? Math.round(
            liveFights.reduce((total, fight) => total + fight.runtimeA + fight.runtimeB, 0) /
              (liveFights.length * 2)
          )
        : 0,
    eventsPerSecond: liveFights.length > 0 ? 180 + liveFights.length * 42 : 0,
    timeoutRisks: liveFights.length > 0 ? Math.min(2, liveFights.length) : 0,
  };
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Header */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-3 h-3 bg-afc-red animate-pulse glow-red" />
              <h1 className="text-4xl font-bold uppercase tracking-tight">Live Arena</h1>
              <TagBadge variant="champion">{liveFights.length} Active</TagBadge>
            </motion.div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-afc-steel-light" />
                <span className="text-afc-steel-light uppercase tracking-wider text-xs">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission Control Panel */}
      <section className="border-b border-afc-steel-dark bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="grid grid-cols-5 gap-4 mb-8">
            <StatCard
              label="Active Agents"
              value={liveTelemetry.activeAgents}
              icon={Activity}
              color="lime"
              animated
            />
            <StatCard
              label="Budget Burn"
              value={liveTelemetry.totalBudgetBurn}
              prefix="$"
              icon={DollarSign}
              color="yellow"
              decimals={2}
              animated
            />
            <StatCard
              label="Avg Runtime"
              value={liveTelemetry.avgRuntime}
              suffix="s"
              icon={Clock}
              animated
            />
            <StatCard
              label="Events/Sec"
              value={liveTelemetry.eventsPerSecond}
              icon={Zap}
              color="orange"
              animated
            />
            <StatCard
              label="Timeout Risks"
              value={liveTelemetry.timeoutRisks}
              icon={AlertTriangle}
              color="red"
              animated
            />
          </div>
        </div>
      </section>
      
      {/* Live Fights */}
      {liveFights.length > 0 && (
        <section className="border-b border-afc-steel-dark">
          <div className="max-w-[1600px] mx-auto px-8 py-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-afc-red animate-pulse" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Active Bouts</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {liveFights.map((fight, idx) => (
                <motion.div 
                  key={fight.id} 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <FightCard fight={fight} variant="featured" />
                  
                  {/* Live Telemetry */}
                  <div className="border border-afc-steel-dark bg-afc-charcoal p-4">
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                      Live Telemetry
                    </div>
                    
                    <div className="space-y-3">
                      {/* Progress bars */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-afc-steel-light">Round Progress</span>
                          <span className="font-mono">{Math.floor((progress / 100) * fight.rounds)} / {fight.rounds}</span>
                        </div>
                        <div className="h-2 bg-afc-black relative overflow-hidden">
                          <motion.div 
                            className="h-full bg-afc-orange"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-afc-steel-light">Budget Used</span>
                          <span className="font-mono">${budget.toFixed(2)} / $1.00</span>
                        </div>
                        <div className="h-2 bg-afc-black relative overflow-hidden">
                          <motion.div 
                            className="h-full bg-afc-yellow"
                            initial={{ width: 0 }}
                            animate={{ width: `${(budget / 1.0) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      
                      {/* Event Stream */}
                      <div className="pt-3 border-t border-afc-grid">
                        <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2">
                          Event Stream
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          {events.map((event, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-afc-steel-light">{event.timestamp}</span>
                              <span className={
                                event.type === 'success' ? 'text-afc-lime' :
                                event.type === 'warning' ? 'text-afc-yellow' :
                                event.type === 'error' ? 'text-afc-red' : ''
                              }>
                                {event.type === 'success' && '✓ '}
                                {event.message}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Scheduled Fights */}
      {scheduledFights.length > 0 && (
        <section className="bg-afc-charcoal">
          <div className="max-w-[1600px] mx-auto px-8 py-12">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-afc-steel" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Upcoming</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {scheduledFights.map((fight) => (
                <FightCard key={fight.id} fight={fight} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* No Live Fights State */}
      {liveFights.length === 0 && (
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-8 text-center">
            <Activity className="w-16 h-16 text-afc-steel-dark mx-auto mb-6" />
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 text-afc-steel">
              No Active Fights
            </h2>
            <p className="text-afc-steel-light max-w-md mx-auto">
              Check back soon for live battles. View upcoming matches below or browse past replays.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
