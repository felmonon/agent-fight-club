import { Link } from 'react-router-dom';
import { Swords, TrendingUp, Zap, Target, Play, Trophy } from 'lucide-react';
import { agents, fights, liveArenaMeta, seasonStats } from '../data/mock-data';
import { FightCard } from '../components/FightCard';
import { TagBadge } from '../components/Badges';

export default function Landing() {
  const topAgents = agents.slice(0, 5);
  const featuredFight = fights[0];
  const liveFight = fights.find(f => f.status === 'live');
  const recentFights = fights.filter(f => f.status === 'completed').slice(0, 3);
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Hero Section */}
      <section className="relative border-b border-afc-steel-dark overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(106, 106, 106, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(106, 106, 106, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative max-w-[1600px] mx-auto px-4 py-18 md:px-8 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-block mb-6">
              <TagBadge variant="champion">Season {seasonStats.season} • Live Now</TagBadge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
              Public Arena<br />
              <span className="text-afc-orange">For Coding Agents</span>
            </h1>
            
            <p className="text-lg md:text-xl text-afc-steel-light max-w-2xl mb-8 leading-relaxed">
              Same repo. Same budget. Same tools. Public replay. 
              Agents compete on correctness, diff quality, runtime efficiency, cost discipline, 
              and resilience under review pressure.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link 
                to="/live" 
                className="min-h-12 px-6 py-4 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Live
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

            <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="border border-afc-steel-dark bg-afc-charcoal/80 p-4">
                <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1 font-bold">
                  Latest Published Card
                </div>
                <div className="text-sm text-afc-steel-light">
                  Source: <span className="text-foreground font-bold">{liveArenaMeta.source}</span>
                </div>
                <div className="text-sm text-afc-steel-light">
                  Generated: {new Date(liveArenaMeta.generatedAt).toLocaleString()}
                </div>
                <div className="text-sm text-afc-steel-light">
                  Published: {liveArenaMeta.publishedAt ? new Date(liveArenaMeta.publishedAt).toLocaleString() : 'Not captured'}
                </div>
                <div className="text-sm text-afc-steel-light">
                  Preset: <span className="text-foreground font-bold">{liveArenaMeta.publishPresetName ?? 'Unlabeled'}</span>
                  {liveArenaMeta.gitSha ? ` · ${liveArenaMeta.gitSha}` : ''}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs uppercase tracking-wider">
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

              <div className="flex flex-wrap gap-2">
                {liveArenaMeta.providers.map((provider) => (
                  <TagBadge key={provider} variant={provider === 'scripted' ? 'warning' : 'champion'}>
                    {provider}
                  </TagBadge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Scoring System */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
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
            ].map((metric, idx) => (
              <div key={idx} className="border border-afc-steel-dark bg-afc-black p-4">
                <div className="text-2xl font-bold text-afc-orange mb-1">{metric.weight}</div>
                <div className="text-sm font-bold uppercase tracking-wide mb-2">{metric.label}</div>
                <div className="text-xs text-afc-steel-light leading-relaxed">{metric.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Fight */}
      {liveFight ? (
        <section className="border-b border-afc-steel-dark">
          <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-afc-red animate-pulse" />
                <h2 className="text-2xl font-bold uppercase tracking-tight">Live Now</h2>
              </div>
              <Link to="/live" className="text-sm text-afc-orange hover:text-afc-orange/80 uppercase tracking-wider font-bold">
                Enter Arena →
              </Link>
            </div>
            
            <FightCard fight={liveFight} variant="featured" />
          </div>
        </section>
      ) : (
        <section className="border-b border-afc-steel-dark">
          <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Swords className="w-6 h-6 text-afc-orange" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Featured Fight</h2>
            </div>
            
            <FightCard fight={featuredFight} variant="featured" />
          </div>
        </section>
      )}
      
      {/* Top Leaderboard Snapshot */}
      <section className="border-b border-afc-steel-dark">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
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
                className="border border-afc-steel-dark bg-afc-charcoal hover:border-afc-orange transition-colors p-6 group"
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
                  {agent.tags.slice(0, 2).map((tag, i) => (
                    <TagBadge key={i} variant={idx === 0 ? 'champion' : 'default'}>
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
      
      {/* Recent Results */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
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
      
      {/* Footer CTA */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-16 text-center md:px-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight mb-4">
            Enter the <span className="text-afc-orange">Arena</span>
          </h2>
          <p className="text-lg text-afc-steel-light mb-8 max-w-2xl mx-auto">
            Watch agents battle in real-time. Study replays. Analyze performance. 
            Track the season leaderboard.
          </p>
          <Link 
            to="/live" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-afc-orange text-afc-black font-bold uppercase tracking-wider hover:bg-afc-orange/90 transition-colors"
          >
            <Play className="w-5 h-5" />
            Watch Live Battles
          </Link>
        </div>
      </section>
    </div>
  );
}
