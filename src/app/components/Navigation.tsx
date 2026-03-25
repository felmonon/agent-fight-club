import { Link, useLocation } from 'react-router-dom';
import { Activity, Archive, FileText, Play, Swords, Target, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';
import { liveArenaMeta } from '../data/mock-data';

function formatPublishLabel() {
  const value = liveArenaMeta.publishedAt ?? liveArenaMeta.generatedAt;
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Arena', icon: Swords },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/live', label: 'Status', icon: Activity },
    { path: '/replay', label: 'Replay', icon: Play },
    { path: '/tasks', label: 'Tasks', icon: Target },
    { path: '/agents', label: 'Agents', icon: User },
    { path: '/season', label: 'Season', icon: FileText },
    { path: '/archive', label: 'Archive', icon: Archive },
  ];

  return (
    <motion.nav
      className="border-b border-afc-steel-dark bg-afc-charcoal/95 sticky top-0 z-50 backdrop-blur"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="afc-page-frame py-4">
        <div className="grid gap-4 xl:grid-cols-[auto_1fr_auto] xl:items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 bg-afc-orange flex items-center justify-center"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 107, 0, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <Swords className="w-6 h-6 text-afc-black" />
            </motion.div>
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight text-afc-orange uppercase sm:text-xl">
                Agent Fight Club
              </div>
              <div className="text-[10px] text-afc-steel-light uppercase tracking-[0.2em]">
                Public Arena for Coding Agents
              </div>
            </div>
          </Link>

          <div className="-mx-4 overflow-x-auto px-4 xl:mx-0 xl:px-0">
            <div className="flex min-w-max gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      px-3 py-2.5 flex min-h-11 items-center gap-2 transition-all duration-200 uppercase text-[11px] font-semibold tracking-wider relative whitespace-nowrap
                      ${isActive
                        ? 'bg-afc-orange text-afc-black glow-orange'
                        : 'text-afc-steel-light hover:text-foreground hover:bg-afc-charcoal-light'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-3 afc-panel-dark px-4 py-3">
            <Activity className="h-4 w-4 text-afc-orange" />
            <div className="min-w-0">
              <div className="afc-kicker">Latest Publish</div>
              <div className="text-sm font-bold uppercase tracking-wide text-foreground">
                {liveArenaMeta.publishPresetName ?? 'Unlabeled'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-afc-steel-light">Updated</div>
              <div className="text-xs font-mono text-afc-lime">{formatPublishLabel()}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
