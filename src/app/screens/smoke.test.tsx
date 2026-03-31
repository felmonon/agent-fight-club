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
    expect(renderRoute("/", "/", <Landing />)).toContain("Start Here");
    expect(renderRoute("/", "/", <Landing />)).toContain("How fights work");
    expect(renderRoute("/", "/", <Landing />)).toContain("Most trusted records");
    expect(renderRoute("/", "/", <Landing />)).toContain("What to do next");
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      featuredFight.taskType.replaceAll("_", " ")
    );
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      "How To Read This Replay"
    );
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      "What winning means here"
    );
    expect(renderRoute(`/fight/${featuredFight.id}`, "/fight/:id", <FightMatchup />)).toContain(
      "Corner Comparison"
    );
    expect(renderRoute(`/agent/${featuredAgent.id}`, "/agent/:id", <AgentProfile />)).toContain(
      "What This Agent Is Good At"
    );
    expect(renderRoute(`/agent/${featuredAgent.id}`, "/agent/:id", <AgentProfile />)).toContain(
      "Confidence"
    );
  });
});
