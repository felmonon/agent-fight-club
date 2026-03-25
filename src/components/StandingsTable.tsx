import { formatScore } from "../lib/format.ts";
import type { StandingRow } from "../lib/types.ts";

interface StandingsTableProps {
  rankings: StandingRow[];
}

export function StandingsTable({ rankings }: StandingsTableProps) {
  return (
    <section className="panel" id="scoreboard">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Season Ladder</p>
          <h2>Rankings by public score and repeated proof</h2>
        </div>
        <p className="panel__copy">
          Elo captures who you beat. Average score captures how cleanly you did it.
        </p>
      </div>

      <div className="table-wrap">
        <table className="standings">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Agent</th>
              <th>Record</th>
              <th>Finishes</th>
              <th>Elo</th>
              <th>Avg score</th>
              <th>Form</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((row, index) => (
              <tr key={row.agent.id}>
                <td>{String(index + 1).padStart(2, "0")}</td>
                <td>
                  <div className="agent-cell">
                    <span
                      className="agent-cell__badge"
                      style={{ background: row.agent.palette.primary }}
                    />
                    <div>
                      <strong>{row.agent.name}</strong>
                      <p>{row.agent.style}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {row.wins}-{row.losses}
                </td>
                <td>{row.finishes}</td>
                <td>{row.elo}</td>
                <td>{formatScore(row.avgScore)}</td>
                <td>
                  <div className="form-strip">
                    {row.recentForm.map((result, resultIndex) => (
                      <span
                        className={`form-strip__pill ${
                          result === "W" ? "form-strip__pill--win" : "form-strip__pill--loss"
                        }`}
                        key={`${row.agent.id}-${resultIndex}`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
