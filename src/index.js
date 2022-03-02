import { useLayoutEffect, useCallback, useState, useRef } from "react";

const timeDefault = {
  ms: 0,
  s: 0,
  m: 0,
  h: 0,
  d: 0,
};

export const useFrameTimer = (cb, minFps = 60, stopTime) => {
  const [clock, setClock] = useState(0);
  const [stop, setStop] = useState(false);
  const [start, setStart] = useState(false);
  const timeRef = useRef(timeDefault);
  const timerRef = useRef();
  const timestampRef = useRef();
  const pauseTimestampRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const fpsRef = useRef([]);
  const lastCalledTimeRef = useRef(0);

  const handleReset = () => {
    setStop(false);
    setStart(false);
    timeRef.current = timeDefault;
    pauseTimestampRef.current = 0;
    pauseTimeRef.current = 0;
    timestampRef.current = undefined;
    fpsRef.current = [];
    lastCalledTimeRef.current = undefined;
  };

  const handleStart = () => {
    setStart(!start);
    if (!start) {
      lastCalledTimeRef.current = undefined;
      fpsRef.current = [];
    }
  };

  const handleStop = () => {
    setStop(true);
    lastCalledTimeRef.current = undefined;
    fpsRef.current = [];
  };

  const pause = !start && timeRef.current.ms > 0;

  const cbData = {
    setStart: handleStart,
    setStop: handleStop,
    pause,
  };

  const animate = useCallback(() => {
    const msTime =
      performance.now() - timestampRef.current - pauseTimeRef.current;
    const ms = Math.floor(msTime);

    timeRef.current = {
      ms,
      s: Math.floor(ms / 1000),
      m: Math.floor(ms / 1000 / 60),
      h: Math.floor(ms / 1000 / 3600),
      d: Math.floor(ms / 1000 / 3600 / 24),
    };

    ms > 0 && setClock(Math.floor(ms * (minFps / 1000)));

    if (!!stopTime && msTime >= stopTime) {
      handleStart();
    } else {
      timerRef.current = requestAnimationFrame(animate);
    }
  }, [minFps, stopTime]);

  useLayoutEffect(() => {
    if (start) {
      if (!timestampRef.current) {
        timestampRef.current = performance.now();
      } else {
        pauseTimeRef.current =
          pauseTimeRef.current +
          (performance.now() - pauseTimestampRef.current);
      }
      timerRef.current = requestAnimationFrame(animate);
    } else {
      if (timestampRef.current) {
        pauseTimestampRef.current = performance.now();
      }
    }

    if (!stop && pause) {
      cb({
        time: timeRef.current,
        fps: 0,
        ...cbData,
      });
    }

    if (stop) {
      cancelAnimationFrame(timerRef.current);
      handleReset();
    }
    return () => cancelAnimationFrame(timerRef.current);
  }, [start, stop]);

  useLayoutEffect(() => {
    if (lastCalledTimeRef.current) {
      const delta = (performance.now() - lastCalledTimeRef.current) / 1000;
      if (fpsRef.current.length > 5) {
        fpsRef.current.splice(5);
      }
      fpsRef.current.unshift(
        parseFloat((1 / delta).toFixed(minFps < 1 ? 3 : 0))
      );
    }
    lastCalledTimeRef.current = performance.now();

    !((!start && timeRef.current.ms > 0) || stop) &&
      cb({
        time: timeRef.current,
        fps:
          !start || stop
            ? 0
            : fpsRef.current.length === 6
            ? Math.max.apply(Math, fpsRef.current.slice(0, 3))
            : 0,
        ...cbData,
      });
  }, [clock, start, stop]);

  return [start, pause, handleStart, handleStop];
};
