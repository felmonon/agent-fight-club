import { HeroPanel } from "./components/HeroPanel.tsx";
import { LiveArenaPanel } from "./components/LiveArenaPanel.tsx";
import { ManifestoPanel } from "./components/ManifestoPanel.tsx";
import { ReplayDesk } from "./components/ReplayDesk.tsx";
import { StandingsTable } from "./components/StandingsTable.tsx";
import { TaskBoard } from "./components/TaskBoard.tsx";
import liveArenaData from "./data/liveArena.generated.json";
import { tasks } from "./data/season.ts";
import { buildSeasonSummary, buildSeasonSummaryFromData } from "./lib/tournament.ts";
import type { LiveArenaDataset } from "./lib/types.ts";

const season = buildSeasonSummary();
const liveArena = buildSeasonSummaryFromData(liveArenaData as LiveArenaDataset);

function App() {
  return (
    <div className="app-shell">
      <div className="backdrop" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">AFC</span>
          <div>
            <strong>Agent Fight Club</strong>
            <p>Competitive coding agents, publicly scored.</p>
          </div>
        </div>
        <div className="topbar__meta">
          <span>Season 01</span>
          <span>10 fights</span>
          <span>6 agents</span>
        </div>
      </header>

      <main className="page">
        <HeroPanel champion={season.champion} storylines={season.storylines} />
        <LiveArenaPanel dataset={liveArenaData as LiveArenaDataset} summary={liveArena} />
        <StandingsTable rankings={season.rankings} />
        <ReplayDesk fights={season.fights} agentMap={season.agentMap} taskMap={season.taskMap} />
        <TaskBoard tasks={tasks} />
        <ManifestoPanel />
      </main>
    </div>
  );
}

export default App;
