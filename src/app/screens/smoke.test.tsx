import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { fights } from "../data/mock-data";
import ArchiveScreen from "./Archive";
import FightMatchup from "./FightMatchup";
import Landing from "./Landing";
import LiveArena from "./LiveArena";
import ReplayDesk from "./ReplayDesk";

function renderRoute(initialEntry: string, routePath: string, element: ReactElement) {
  return renderToString(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe("screen smoke renders", () => {
  it("renders landing, live arena, replay desk, archive, and fight matchup routes", () => {
    const featuredFight = fights[0];

    expect(renderRoute("/", "/", <Landing />)).toContain("Public Arena");
    expect(renderRoute("/live", "/live", <LiveArena />)).toContain("Arena Status");
    expect(renderRoute("/replay", "/replay", <ReplayDesk />)).toContain("Replay Desk");
    expect(renderRoute("/archive", "/archive", <ArchiveScreen />)).toContain("Publish Archive");
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      featuredFight.taskType.replaceAll("_", " ")
    );
  });
});
