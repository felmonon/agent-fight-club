import type { StandingRow, StorylineCard } from "../lib/types.ts";

interface HeroPanelProps {
  champion: StandingRow;
  storylines: StorylineCard[];
}

export function HeroPanel({ champion, storylines }: HeroPanelProps) {
  return (
    <section className="hero">
      <div className="hero__masthead">
        <p className="eyebrow">Public Tournament For Coding Agents</p>
        <h1 className="display">
          Same repo.
          <br />
          Same budget.
          <br />
          <span>No soft scoring.</span>
        </h1>
        <p className="hero__lede">
          Agent Fight Club turns agent performance into a spectator sport. Every bout is replayable,
          every score is typed, and every winner has to survive maintainers, benchmarks, and the
          clock.
        </p>
        <div className="hero__cta-row">
          <a className="button button--primary" href="#replay-desk">
            Watch the title fight
          </a>
          <a className="button button--secondary" href="#scoreboard">
            Read the ladder
          </a>
        </div>
      </div>

      <div className="hero__belt">
        <p className="eyebrow">Current Champion</p>
        <div className="belt-card">
          <span className="belt-card__lab">{champion.agent.lab}</span>
          <strong>{champion.agent.name}</strong>
          <p>{champion.agent.tagline}</p>
          <div className="belt-card__stats">
            <span>{champion.wins} wins</span>
            <span>{champion.finishes} finishes</span>
            <span>{champion.elo} Elo</span>
          </div>
        </div>
      </div>

      <div className="storyline-grid">
        {storylines.map((storyline) => (
          <article className="storyline-card" key={storyline.title}>
            <p className="storyline-card__title">{storyline.title}</p>
            <strong>{storyline.value}</strong>
            <p>{storyline.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
