import { useDeferredValue, useEffect, useState, startTransition } from "react";
import { formatPercent, formatScore } from "../lib/format.ts";
import type { AgentProfile, ComputedFightReplay, TaskCard } from "../lib/types.ts";

interface ReplayDeskProps {
  fights: ComputedFightReplay[];
  agentMap: Map<string, AgentProfile>;
  taskMap: Map<string, TaskCard>;
}

const categories = ["all", "title", "security", "performance", "ui", "hotfix", "data"] as const;
type ReplayCategory = (typeof categories)[number];

function categoryMatches(category: ReplayCategory, task: TaskCard, fight: ComputedFightReplay): boolean {
  if (category === "all") {
    return true;
  }
  if (category === "title") {
    return Boolean(fight.titleFight);
  }

  const normalized = task.category.toLowerCase();
  if (category === "ui") {
    return normalized.includes("ui");
  }
  if (category === "hotfix") {
    return normalized.includes("hotfix");
  }
  if (category === "performance") {
    return normalized.includes("performance");
  }
  if (category === "security") {
    return normalized.includes("security");
  }
  return normalized.includes("data");
}

export function ReplayDesk({ fights, agentMap, taskMap }: ReplayDeskProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ReplayCategory>("all");
  const [selectedId, setSelectedId] = useState(fights[0]?.id ?? "");
  const deferredQuery = useDeferredValue(query);
  const needle = deferredQuery.trim().toLowerCase();

  const filteredFights = fights.filter((fight) => {
    const task = taskMap.get(fight.taskId)!;
    const blue = agentMap.get(fight.blue.agentId)!;
    const red = agentMap.get(fight.red.agentId)!;
    const haystack = `${fight.headline} ${task.name} ${task.repo} ${blue.name} ${red.name}`.toLowerCase();
    return categoryMatches(category, task, fight) && (!needle || haystack.includes(needle));
  });

  useEffect(() => {
    if (filteredFights.length === 0) {
      return;
    }
    if (!filteredFights.some((fight) => fight.id === selectedId)) {
      setSelectedId(filteredFights[0].id);
    }
  }, [filteredFights, selectedId]);

  const selectedFight = filteredFights.find((fight) => fight.id === selectedId) ?? filteredFights[0];

  if (!selectedFight) {
    return null;
  }

  const blueAgent = agentMap.get(selectedFight.blue.agentId)!;
  const redAgent = agentMap.get(selectedFight.red.agentId)!;
  const task = taskMap.get(selectedFight.taskId)!;

  return (
    <section className="replay-grid" id="replay-desk">
      <div className="panel replay-list">
        <div className="panel__header panel__header--tight">
          <div>
            <p className="eyebrow">Replay Desk</p>
            <h2>Every fight gets a paper trail</h2>
          </div>
          <p className="panel__copy">
            Search by agent, repo, or task. No hidden wins. No vibes-only scorecards.
          </p>
        </div>

        <div className="filter-bar">
          <input
            aria-label="Search fights"
            className="search-input"
            onChange={(event) => {
              const value = event.target.value;
              startTransition(() => setQuery(value));
            }}
            placeholder="Search fights, tasks, or agents"
            type="search"
            value={query}
          />
          <div className="chip-row">
            {categories.map((chip) => (
              <button
                className={`chip ${chip === category ? "chip--active" : ""}`}
                key={chip}
                onClick={() => setCategory(chip)}
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="match-feed">
          {filteredFights.map((fight) => {
            const left = agentMap.get(fight.blue.agentId)!;
            const right = agentMap.get(fight.red.agentId)!;
            return (
              <button
                className={`match-card ${fight.id === selectedFight.id ? "match-card--active" : ""}`}
                key={fight.id}
                onClick={() => setSelectedId(fight.id)}
                type="button"
              >
                <div className="match-card__topline">
                  <span>{fight.venue}</span>
                  <span>{fight.finish}</span>
                </div>
                <strong>{fight.headline}</strong>
                <p>{taskMap.get(fight.taskId)?.name}</p>
                <div className="match-card__scoreline">
                  <span>{left.name}</span>
                  <span>{formatScore(fight.blueScore)}</span>
                  <span className="match-card__dash">vs</span>
                  <span>{formatScore(fight.redScore)}</span>
                  <span>{right.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <article className="panel replay-inspector">
        <div className="panel__header panel__header--tight">
          <div>
            <p className="eyebrow">{selectedFight.titleFight ? "World Title Replay" : "Featured Replay"}</p>
            <h2>{selectedFight.headline}</h2>
          </div>
          <p className="panel__copy">
            {task.name} on <span className="mono">{task.repo}</span>
          </p>
        </div>

        <div className="replay-meta">
          <span>{selectedFight.division}</span>
          <span>{selectedFight.venue}</span>
          <span>{selectedFight.budgetMinutes} min budget</span>
          <span>{selectedFight.tokenBudgetK}k token cap</span>
        </div>

        <div className="versus">
          <div className="corner">
            <span className="corner__label">Blue corner</span>
            <strong>{blueAgent.name}</strong>
            <p>{selectedFight.blue.promptStyle}</p>
            <span className="corner__score">{formatScore(selectedFight.blueScore)}</span>
          </div>
          <div className="versus__result">
            <span className="eyebrow">Method</span>
            <strong>{selectedFight.finish}</strong>
            <p>{formatScore(selectedFight.margin)} point margin</p>
          </div>
          <div className="corner corner--right">
            <span className="corner__label">Red corner</span>
            <strong>{redAgent.name}</strong>
            <p>{selectedFight.red.promptStyle}</p>
            <span className="corner__score">{formatScore(selectedFight.redScore)}</span>
          </div>
        </div>

        <div className="metrics-grid">
          {[
            ["correctness", selectedFight.blue.metrics.correctness, selectedFight.red.metrics.correctness],
            ["diff quality", selectedFight.blue.metrics.diffQuality, selectedFight.red.metrics.diffQuality],
            ["runtime", selectedFight.blue.metrics.runtime, selectedFight.red.metrics.runtime],
            ["cost", selectedFight.blue.metrics.cost, selectedFight.red.metrics.cost],
            ["resilience", selectedFight.blue.metrics.resilience, selectedFight.red.metrics.resilience]
          ].map(([label, blue, red]) => (
            <div className="metric-row" key={label}>
              <span>{formatPercent(Number(blue))}</span>
              <div className="metric-row__bars" aria-hidden="true">
                <div className="metric-row__bar metric-row__bar--left" style={{ width: `${blue}%` }} />
                <div className="metric-row__center">{label}</div>
                <div className="metric-row__bar metric-row__bar--right" style={{ width: `${red}%` }} />
              </div>
              <span>{formatPercent(Number(red))}</span>
            </div>
          ))}
        </div>

        <div className="replay-columns">
          <div className="panel panel--inner">
            <p className="eyebrow">Patch notes</p>
            <h3>What each agent actually did</h3>
            <div className="patch-note">
              <strong>{blueAgent.name}</strong>
              <p>{selectedFight.blue.diffSummary}</p>
              <span>{selectedFight.blue.notableMove}</span>
            </div>
            <div className="patch-note">
              <strong>{redAgent.name}</strong>
              <p>{selectedFight.red.diffSummary}</p>
              <span>{selectedFight.red.notableMove}</span>
            </div>
          </div>

          <div className="panel panel--inner">
            <p className="eyebrow">Judges memo</p>
            <h3>Why the fight swung</h3>
            <p className="judges-memo">{selectedFight.judgesMemo}</p>
            <ol className="moment-list">
              {selectedFight.keyMoments.map((moment) => (
                <li key={moment}>{moment}</li>
              ))}
            </ol>
          </div>
        </div>
      </article>
    </section>
  );
}
