import { useRef, useState, useLayoutEffect } from "react";

const timeDefault = {
  ms: 0,
  s: 0,
  m: 0,
  h: 0,
  d: 0,
};

export const useFrameTimer = (cb) => {
  const time = useRef(timeDefault);
  const timerRef = useRef();
  const timestamp = useRef();
  const pauseTimestamp = useRef(0);
  const pauseTime = useRef(0);
  const fps = useRef(0);
  const lastCalledTime = useRef();
  const [stop, setStop] = useState(false);
  const [start, setStart] = useState(false);

  const handleReset = () => {
    setStop(false);
    setStart(false);
    time.current = timeDefault;
    pauseTimestamp.current = 0;
    pauseTime.current = 0;
    timestamp.current = undefined;
    fps.current = 0;
    lastCalledTime.current = undefined;
  };

  const handleStart = () => {
    setStart(!start);
  };

  const handleStop = () => {
    setStop(true);
  };

  const pause = !start && time.current.ms > 0;

  const cbData = {
    setStart: handleStart,
    setStop: handleStop,
    pause,
  };

  const animate = useCallback(() => {
    const now = performance.now();
    const ms = now - timestamp.current - pauseTime.current;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(ms / 1000 / 60);
    const h = Math.floor(ms / 1000 / 3600);
    const d = Math.floor(ms / 1000 / 3600 / 24);
    time.current = {
      ms,
      s,
      m,
      h,
      d,
    };

    if (!lastCalledTime.current) {
      lastCalledTime.current = now;
    }
    const delta = (now - lastCalledTime.current) / 1000;

    fps.current = Math.round(1 / delta);
    lastCalledTime.current = performance.now();

    cb({
      time: time.current,
      fps: fps.current,
      ...cbData,
    });

    timerRef.current = requestAnimationFrame(animate);
  }, []);

  useLayoutEffect(() => {
    if (start) {
      if (!timestamp.current) {
        timestamp.current = performance.now();
      } else {
        pauseTime.current =
          pauseTime.current + (performance.now() - pauseTimestamp.current);
      }
      timerRef.current = requestAnimationFrame(animate);
    } else {
      if (timestamp.current) {
        pauseTimestamp.current = performance.now();
      }
    }

    if (pause) {
      cb({
        time: time.current,
        fps: 0,
        ...cbData,
      });
    }

    if (stop) {
      cancelAnimationFrame(timerRef.current);
      handleReset();
      cb({
        time: timeDefault,
        fps: 0,
        ...cbData,
      });
    }
    return () => cancelAnimationFrame(timerRef.current);
  }, [start, stop]);

  return [start, pause, handleStart, handleStop];
};
