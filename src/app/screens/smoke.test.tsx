import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { agents, fights } from "../data/mock-data";
import AgentProfile from "./AgentProfile";
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
    const featuredAgent = agents[0];

    expect(renderRoute("/", "/", <Landing />)).toContain("Public Arena");
    expect(renderRoute("/", "/", <Landing />)).toContain("Scoring contract");
    expect(renderRoute("/", "/", <Landing />)).toContain("Confidence leaders");
    expect(renderRoute("/", "/", <Landing />)).toContain("What They Are Competing On");
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      featuredFight.taskType.replaceAll("_", " ")
    );
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      "What winning means here"
    );
    expect(renderRoute(`/agent/${featuredAgent.id}`, "/agent/:id", <AgentProfile />)).toContain(
      "Capability Profile"
    );
    expect(renderRoute(`/agent/${featuredAgent.id}`, "/agent/:id", <AgentProfile />)).toContain(
      "Confidence"
    );
  });
});
