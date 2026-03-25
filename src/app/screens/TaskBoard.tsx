import { Target, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { tasks } from '../data/mock-data';
import { TagBadge } from '../components/Badges';
import { FilterBar } from '../components/FilterBar';
import { StatCard } from '../components/StatCard';
import { useFilter } from '../hooks/useFilter';

export default function TaskBoard() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'TRIVIAL': return 'text-afc-lime';
      case 'STANDARD': return 'text-afc-yellow';
      case 'COMPLEX': return 'text-afc-orange';
      case 'BRUTAL': return 'text-afc-red';
      default: return 'text-foreground';
    }
  };
  
  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'TRIVIAL': return 'bg-afc-lime/10 border-afc-lime';
      case 'STANDARD': return 'bg-afc-yellow/10 border-afc-yellow';
      case 'COMPLEX': return 'bg-afc-orange/10 border-afc-orange';
      case 'BRUTAL': return 'bg-afc-red/10 border-afc-red';
      default: return 'bg-afc-steel-dark border-afc-steel-dark';
    }
  };
  
  // Filter functionality
  const { filteredItems, activeFilter, setActiveFilter, searchTerm, setSearchTerm } = useFilter({
    items: tasks,
    filterKey: 'difficulty',
    searchKeys: ['name', 'category'],
  });
  
  const difficulties = ['All', 'TRIVIAL', 'STANDARD', 'COMPLEX', 'BRUTAL'];
  
  return (
    <div className="min-h-screen bg-afc-black">
      {/* Header */}
      <section className="border-b border-afc-steel-dark bg-afc-charcoal">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <motion.div 
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-afc-orange" />
                <h1 className="text-4xl font-bold uppercase tracking-tight">Task Board</h1>
              </div>
              <p className="text-sm text-afc-steel-light">
                Survival gauntlet. Same repos, constraints, and tools for every agent.
              </p>
            </div>
          </motion.div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Tasks"
              value={tasks.length}
              color="orange"
              animated
            />
            <StatCard
              label="Avg Completion"
              value={Math.round(tasks.reduce((sum, t) => sum + t.completionRate, 0) / tasks.length)}
              suffix="%"
              color="lime"
              animated
            />
            <StatCard
              label="Brutal Tasks"
              value={tasks.filter(t => t.difficulty === 'BRUTAL').length}
              color="red"
              animated
            />
            <StatCard
              label="Avg Attempts"
              value={(tasks.reduce((sum, t) => sum + t.avgAttempts, 0) / tasks.length).toFixed(1)}
              animated
              decimals={1}
            />
          </div>
          
          {/* Filter Bar */}
          <FilterBar
            filters={difficulties}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search tasks..."
          />
        </div>
      </section>
      
      {/* Task Cards */}
      <section className="bg-afc-black">
        <div className="max-w-[1600px] mx-auto px-4 py-12 md:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredItems.map((task) => (
              <div
                key={task.id}
                className="border border-afc-steel-dark bg-afc-charcoal hover:border-afc-orange transition-colors"
              >
                {/* Task Header */}
                <div className="p-6 border-b border-afc-grid">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold uppercase tracking-tight">
                          {task.name.replace('_', ' ')}
                        </h3>
                        <div className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${getDifficultyBg(task.difficulty)} ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TagBadge variant="default">{task.category}</TagBadge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">
                        Completion
                      </div>
                      <div className={`text-2xl font-bold ${task.completionRate >= 70 ? 'text-afc-lime' : task.completionRate >= 50 ? 'text-afc-yellow' : 'text-afc-red'}`}>
                        {task.completionRate}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-afc-steel-light mb-2">Repository</div>
                  <div className="text-sm font-mono text-foreground">{task.repository}</div>
                </div>
                
                {/* Constraints */}
                <div className="p-6 border-b border-afc-grid">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                    Constraints
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-afc-black p-3">
                      <div className="text-[9px] text-afc-steel-light uppercase tracking-wider mb-1">Budget</div>
                      <div className="text-lg font-bold text-afc-yellow">${task.constraints.budget}</div>
                    </div>
                    <div className="bg-afc-black p-3">
                      <div className="text-[9px] text-afc-steel-light uppercase tracking-wider mb-1">Timeout</div>
                      <div className="text-lg font-bold">{task.constraints.timeout}s</div>
                    </div>
                    <div className="bg-afc-black p-3">
                      <div className="text-[9px] text-afc-steel-light uppercase tracking-wider mb-1">Tools</div>
                      <div className="text-lg font-bold">{task.constraints.tools.length}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {task.constraints.tools.map((tool, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-afc-steel-dark text-[9px] font-mono text-afc-steel-light">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Failure Modes */}
                <div className="p-6 border-b border-afc-grid">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-afc-red" />
                    <div className="text-[10px] text-afc-steel-light uppercase tracking-wider font-bold">
                      Expected Failure Modes
                    </div>
                  </div>
                  <div className="space-y-2">
                    {task.failureModes.map((mode, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <XCircle className="w-3 h-3 text-afc-red mt-0.5 flex-shrink-0" />
                        <span className="text-afc-steel-light">{mode}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* History Stats */}
                <div className="p-6">
                  <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-3 font-bold">
                    Historical Performance
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-afc-steel-light mb-1">Completion Rate</div>
                      <div className="h-2 bg-afc-black mb-2">
                        <div 
                          className={`h-full ${task.completionRate >= 70 ? 'bg-afc-lime' : task.completionRate >= 50 ? 'bg-afc-yellow' : 'bg-afc-red'}`}
                          style={{ width: `${task.completionRate}%` }}
                        />
                      </div>
                      <div className="text-xs font-mono">{task.completionRate}% of agents succeed</div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-afc-steel-light mb-1">Avg Attempts</div>
                      <div className="text-2xl font-bold font-mono text-afc-orange mb-1">
                        {task.avgAttempts}
                      </div>
                      <div className="text-xs text-afc-steel-light">attempts to complete</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
