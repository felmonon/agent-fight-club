import { motion } from 'motion/react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="flex min-w-max gap-2">
        {filters.map((filter, idx) => (
          <motion.button
            key={filter}
            onClick={() => onFilterChange(filter.toLowerCase())}
            className={`min-h-11 px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all duration-200 whitespace-nowrap ${
              activeFilter === filter.toLowerCase()
                ? 'bg-afc-orange text-afc-black glow-orange'
                : 'border border-afc-steel-dark text-afc-steel-light hover:border-afc-steel hover:text-foreground'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {filter}
          </motion.button>
        ))}
        </div>
      </div>
      
      {onSearchChange && (
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afc-steel-light" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-3 bg-afc-charcoal-light border border-afc-steel-dark text-foreground text-sm focus:outline-none focus:border-afc-orange transition-colors w-full"
          />
        </div>
      )}
    </div>
  );
}
