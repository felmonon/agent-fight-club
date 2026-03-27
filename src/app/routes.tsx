import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Navigation } from "./components/Navigation";
import { Skeleton } from "./components/Skeleton";

const Landing = lazy(() => import("./screens/Landing"));
const FightMatchup = lazy(() => import("./screens/FightMatchup"));
const AgentProfile = lazy(() => import("./screens/AgentProfile"));

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
    path: "/fight/:id",
    element: <Layout><FightMatchup /></Layout>,
  },
  {
    path: "/agent/:id",
    element: <Layout><AgentProfile /></Layout>,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
