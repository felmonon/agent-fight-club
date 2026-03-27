import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { fights } from "../data/mock-data";
import FightMatchup from "./FightMatchup";
import Landing from "./Landing";

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
  it("renders landing and fight matchup routes", () => {
    const featuredFight = fights[0];

    expect(renderRoute("/", "/", <Landing />)).toContain("Public Arena");
    expect(renderRoute("/", "/", <Landing />)).toContain("Scoring contract");
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      featuredFight.taskType.replaceAll("_", " ")
    );
  });
});
