import { useState, useRef, useCallback } from 'react';

export type Lap = {
  id: number;
  time: number;
  diff: number;
};

export type StopwatchState = {
  id: string;
  label: string;
  elapsed: number;
  running: boolean;
  laps: Lap[];
  startedAt: number | null;
  lastLapTime: number;
};

export function useStopwatch(id: string, label: string) {
  const [state, setState] = useState<StopwatchState>({
    id,
    label,
    elapsed: 0,
    running: false,
    laps: [],
    startedAt: null,
    lastLapTime: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const baseElapsedRef = useRef<number>(0);

  const start = useCallback(() => {
    setState(prev => {
      if (prev.running) return prev;
      startTimeRef.current = Date.now();
      baseElapsedRef.current = prev.elapsed;
      intervalRef.current = setInterval(() => {
        setState(s => ({
          ...s,
          elapsed: baseElapsedRef.current + (Date.now() - startTimeRef.current),
        }));
      }, 30);
      return { ...prev, running: true, startedAt: Date.now() };
    });
  }, []);

  const stop = useCallback(() => {
    setState(prev => {
      if (!prev.running) return prev;
      if (intervalRef.current) clearInterval(intervalRef.current);
      baseElapsedRef.current = prev.elapsed;
      return { ...prev, running: false };
    });
  }, []);

  const toggle = useCallback(() => {
    setState(prev => {
      if (prev.running) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        baseElapsedRef.current = prev.elapsed;
        return { ...prev, running: false };
      } else {
        startTimeRef.current = Date.now();
        intervalRef.current = setInterval(() => {
          setState(s => ({
            ...s,
            elapsed: baseElapsedRef.current + (Date.now() - startTimeRef.current),
          }));
        }, 30);
        return { ...prev, running: true };
      }
    });
  }, []);

  const lap = useCallback(() => {
    setState(prev => {
      if (!prev.running && prev.elapsed === 0) return prev;
      const lapTime = prev.elapsed;
      const diff = lapTime - prev.lastLapTime;
      const newLap: Lap = {
        id: prev.laps.length + 1,
        time: lapTime,
        diff,
      };
      return {
        ...prev,
        laps: [newLap, ...prev.laps],
        lastLapTime: lapTime,
      };
    });
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    baseElapsedRef.current = 0;
    setState({
      id,
      label,
      elapsed: 0,
      running: false,
      laps: [],
      startedAt: null,
      lastLapTime: 0,
    });
  }, [id, label]);

  const rename = useCallback((newLabel: string) => {
    setState(prev => ({ ...prev, label: newLabel }));
  }, []);

  return { state, start, stop, toggle, lap, reset, rename };
}
