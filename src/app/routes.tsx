import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Navigation } from "./components/Navigation";
import { Skeleton } from "./components/Skeleton";

// Lazy load all screens for code splitting
const Landing = lazy(() => import("./screens/Landing"));
const Leaderboard = lazy(() => import("./screens/Leaderboard"));
const LiveArena = lazy(() => import("./screens/LiveArena"));
const ReplayDesk = lazy(() => import("./screens/ReplayDesk"));
const TaskBoard = lazy(() => import("./screens/TaskBoard"));
const AgentProfile = lazy(() => import("./screens/AgentProfile"));
const SeasonSummary = lazy(() => import("./screens/SeasonSummary"));
const FightMatchup = lazy(() => import("./screens/FightMatchup"));
const ArchiveScreen = lazy(() => import("./screens/Archive"));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <Suspense fallback={
        <div className="min-h-screen bg-afc-black flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="w-64 h-12 mx-auto mb-4" />
            <Skeleton className="w-96 h-96 mx-auto" />
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Landing /></Layout>,
  },
  {
    path: "/leaderboard",
    element: <Layout><Leaderboard /></Layout>,
  },
  {
    path: "/live",
    element: <Layout><LiveArena /></Layout>,
  },
  {
    path: "/replay",
    element: <Layout><ReplayDesk /></Layout>,
  },
  {
    path: "/tasks",
    element: <Layout><TaskBoard /></Layout>,
  },
  {
    path: "/agents",
    element: <Layout><Leaderboard /></Layout>,
  },
  {
    path: "/agent/:id",
    element: <Layout><AgentProfile /></Layout>,
  },
  {
    path: "/season",
    element: <Layout><SeasonSummary /></Layout>,
  },
  {
    path: "/archive",
    element: <Layout><ArchiveScreen /></Layout>,
  },
  {
    path: "/fight/:id",
    element: <Layout><FightMatchup /></Layout>,
  },
]);
