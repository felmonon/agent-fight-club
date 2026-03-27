import { Link } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { motion } from 'motion/react';

export function Navigation() {
  return (
    <motion.nav
      className="border-b border-afc-steel-dark bg-afc-charcoal/95 sticky top-0 z-50 backdrop-blur"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="afc-page-frame py-4">
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
      </div>
    </motion.nav>
  );
}
