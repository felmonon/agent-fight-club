import type { FightInsight } from "../data/mock-data";

interface CornerEvidenceProps {
  accentClassName?: string;
  corner: FightInsight["blue"];
  label: string;
}

export function CornerEvidence({
  accentClassName = "text-afc-orange",
  corner,
  label
}: CornerEvidenceProps) {
  const transcriptEntries = corner.transcript.slice(0, 5);

  return (
    <article className="border border-afc-steel-dark bg-afc-charcoal p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="text-[10px] text-afc-steel-light uppercase tracking-wider font-bold">
            {label}
          </div>
          <div className={`text-lg font-bold uppercase tracking-tight ${accentClassName}`}>
            Replay Evidence
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
          <span className="border border-afc-steel-dark bg-afc-black px-2 py-1">{corner.provider}</span>
          {corner.model ? (
            <span className="border border-afc-steel-dark bg-afc-black px-2 py-1">
              {corner.model}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="border border-afc-grid bg-afc-black p-3">
          <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">
            Capture
          </div>
          <div className="text-sm font-bold">
            {corner.durationMs != null ? `${Math.round(corner.durationMs / 1000)}s` : "n/a"}
          </div>
        </div>
        <div className="border border-afc-grid bg-afc-black p-3">
          <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-1">
            Token Estimate
          </div>
          <div className="text-sm font-bold">{corner.tokenEstimateK || 0}k</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
          Changed Files
        </div>
        {corner.changedFiles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {corner.changedFiles.map((file) => (
              <span key={file} className="border border-afc-grid bg-afc-black px-2 py-1 text-xs font-mono text-afc-steel-light">
                {file}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-afc-steel-light">No changed files captured.</div>
        )}
        <div className="text-xs text-afc-steel-light mt-2">
          Changed line estimate: {corner.changedLineCount}
        </div>
      </div>

      {corner.workspaceNotes.length > 0 ? (
        <div className="mb-5">
          <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
            Workspace Notes
          </div>
          <div className="space-y-2">
            {corner.workspaceNotes.slice(0, 4).map((note) => (
              <div key={note} className="text-sm text-afc-steel-light leading-relaxed">
                {note}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-5">
        <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
          Transcript Snippets
        </div>
        {transcriptEntries.length > 0 ? (
          <div className="space-y-3">
            {transcriptEntries.map((entry, index) => (
              <div key={`${entry.channel}-${entry.title ?? "entry"}-${index}`} className="border border-afc-grid bg-afc-black p-3">
                <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] uppercase tracking-wider">
                  <span className={`font-bold ${accentClassName}`}>{entry.channel}</span>
                  {entry.title ? <span className="text-afc-steel-light">{entry.title}</span> : null}
                </div>
                <p className="text-sm text-afc-steel-light whitespace-pre-wrap break-words">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-afc-steel-light">No transcript snippets were captured for this corner.</div>
        )}
      </div>

      {(corner.stdoutTail || corner.stderrTail) ? (
        <div className="space-y-3">
          {corner.stdoutTail ? (
            <div>
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
                Stdout Tail
              </div>
              <pre className="overflow-x-auto border border-afc-grid bg-afc-black p-3 text-xs text-afc-steel-light whitespace-pre-wrap break-words">
                {corner.stdoutTail}
              </pre>
            </div>
          ) : null}
          {corner.stderrTail ? (
            <div>
              <div className="text-[10px] text-afc-steel-light uppercase tracking-wider mb-2 font-bold">
                Stderr Tail
              </div>
              <pre className="overflow-x-auto border border-afc-grid bg-afc-black p-3 text-xs text-afc-red whitespace-pre-wrap break-words">
                {corner.stderrTail}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
