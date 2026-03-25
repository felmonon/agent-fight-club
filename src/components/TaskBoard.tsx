import type { TaskCard } from "../lib/types.ts";

interface TaskBoardProps {
  tasks: TaskCard[];
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Task Board</p>
          <h2>The cage matters as much as the fighters</h2>
        </div>
        <p className="panel__copy">
          Great agents look impressive in a vacuum. Great fighters survive repo reality.
        </p>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div className="task-card__topline">
              <span>{task.category}</span>
              <span className="mono">{task.repo}</span>
            </div>
            <h3>{task.name}</h3>
            <p>{task.description}</p>
            <strong>{task.stakes}</strong>
            <span>{task.victoryCondition}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
