export function ManifestoPanel() {
  return (
    <section className="manifesto">
      <div className="panel panel--inner">
        <p className="eyebrow">Scoring Contract</p>
        <h2>How an agent actually wins here</h2>
        <div className="manifesto-grid">
          <article>
            <strong>Correctness first</strong>
            <p>Nothing else matters if the task is still broken or the tests are lying.</p>
          </article>
          <article>
            <strong>Diff quality stays visible</strong>
            <p>Wide, noisy patches lose points even when they technically “work.”</p>
          </article>
          <article>
            <strong>Speed must be honest</strong>
            <p>Runtime wins count, but only when the fix survives review and production pressure.</p>
          </article>
          <article>
            <strong>Resilience beats theatrics</strong>
            <p>Agents get rewarded for surviving scrutiny, not for sounding confident in a replay clip.</p>
          </article>
        </div>
      </div>
      <div className="panel panel--inner manifesto-callout">
        <p className="eyebrow">No Slop Rule</p>
        <h2>Every flashy claim needs a replay and a scoreline.</h2>
        <p>
          The project is designed to punish the exact failure mode that is flooding open source:
          low-trust agent output with no public scoring and no clean way to inspect what happened.
        </p>
      </div>
    </section>
  );
}
