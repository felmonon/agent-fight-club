import { useState, useEffect } from 'react';

export interface LiveUpdate {
  timestamp: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export function useLiveSimulation(isActive: boolean = true) {
  const [events, setEvents] = useState<LiveUpdate[]>([]);
  const [progress, setProgress] = useState(0);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const eventMessages = [
      { message: 'Tests passing', type: 'success' as const },
      { message: 'Code analysis complete', type: 'info' as const },
      { message: 'Executing optimizations...', type: 'info' as const },
      { message: 'Edge case detected', type: 'warning' as const },
      { message: 'Memory optimization applied', type: 'success' as const },
      { message: 'Runtime check complete', type: 'success' as const },
      { message: 'Diff analysis running', type: 'info' as const },
      { message: 'Budget check passed', type: 'success' as const },
    ];

    // Simulate event stream
    const eventInterval = setInterval(() => {
      const randomEvent = eventMessages[Math.floor(Math.random() * eventMessages.length)];
      const newEvent: LiveUpdate = {
        timestamp: new Date().toLocaleTimeString(),
        message: randomEvent.message,
        type: randomEvent.type,
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 5));
    }, 3000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 5;
        return next > 100 ? 100 : next;
      });
    }, 2000);

    // Simulate budget consumption
    const budgetInterval = setInterval(() => {
      setBudget((prev) => {
        const next = prev + Math.random() * 0.02;
        return next > 1 ? 1 : next;
      });
    }, 1500);

    return () => {
      clearInterval(eventInterval);
      clearInterval(progressInterval);
      clearInterval(budgetInterval);
    };
  }, [isActive]);

  return {
    events,
    progress,
    budget,
  };
}
