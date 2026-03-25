import { Link, useLocation } from 'react-router-dom';
import { Activity, Trophy, Swords, Play, Target, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fights } from '../data/mock-data';

export function Navigation() {
  const location = useLocation();
  const liveFightsCount = fights.filter(f => f.status === 'live').length;
  
  const navItems = [
    { path: '/', label: 'Arena', icon: Swords },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/live', label: 'Live', icon: Activity, badge: liveFightsCount },
    { path: '/replay', label: 'Replay', icon: Play },
    { path: '/tasks', label: 'Tasks', icon: Target },
    { path: '/agents', label: 'Agents', icon: User },
    { path: '/season', label: 'Season', icon: FileText },
  ];
  
  return (
    <motion.nav 
      className="border-b border-afc-steel-dark bg-afc-charcoal sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1600px] mx-auto px-4 py-4 md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
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
                    {item.badge && item.badge > 0 && (
                      <AnimatePresence>
                        <motion.span 
                          className="absolute -top-1 -right-1 w-5 h-5 bg-afc-red text-white text-[10px] font-bold rounded-full flex items-center justify-center glow-red"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          {item.badge}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
