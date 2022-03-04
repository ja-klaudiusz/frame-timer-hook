import { useLayoutEffect, useState, useRef } from "react";

const timeDefault = {
  ms: 0,
  s: 0,
  m: 0,
  h: 0,
  d: 0,
};

export const useFrameTimer = (cb, minFps = 1, stopInfo) => {
  const [clock, setClock] = useState(0);
  const [stop, setStop] = useState(false);
  const [start, setStart] = useState(false);
  const timeRef = useRef(timeDefault);
  const timerRef = useRef();
  const timestampRef = useRef();
  const pauseTimestampRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const counterTimeRef = useRef(0);
  const fpsRef = useRef([]);
  const lastCalledTimeRef = useRef(0);

  const actionReset = () => {
    setStop(false);
    setStart(false);
    setClock(0);
    timeRef.current = timeDefault;
    timerRef.current = undefined;
    pauseTimestampRef.current = 0;
    pauseTimeRef.current = 0;
    counterTimeRef.current = 0;
    timestampRef.current = undefined;
    fpsRef.current = [];
    lastCalledTimeRef.current = undefined;
  };

  const actionStart = () => {
    setStart(!start);
    if (!start) {
      lastCalledTimeRef.current = undefined;
      fpsRef.current = [];
    }
  };

  const actionStop = () => {
    setStop(true);
    lastCalledTimeRef.current = undefined;
    fpsRef.current = [];
  };

  const delayStop = () => {
    const delayTime = stopInfo[2];

    if (delayTime) {
      actionStart();
      setTimeout(() => {
        actionStop();
      }, delayTime);
    } else {
      actionStop();
    }
  };

  const pause = !start && timeRef.current.ms > 0;

  const cbData = {
    setStart: actionStart,
    setStop: actionStop,
    pause,
  };

  const animate = () => {
    const msTime =
      performance.now() - timestampRef.current - pauseTimeRef.current;
    if (msTime) {
      const ms = Math.floor(msTime);

      timeRef.current = {
        ms,
        s: Math.floor(ms / 1000),
        m: Math.floor(ms / 1000 / 60),
        h: Math.floor(ms / 1000 / 3600),
        d: Math.floor(ms / 1000 / 3600 / 24),
      };

      if (!!stopInfo && !stopInfo[1] && msTime >= stopInfo[0]) {
        delayStop();
        return;
      }
      setClock(Math.floor(msTime * (minFps / 1000)));

      timerRef.current = requestAnimationFrame(animate);
    }
  };

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
        counter: counterTimeRef.current,
        time: timeRef.current,
        fps:
          !start || stop
            ? 0
            : fpsRef.current.length === 6
            ? Math.max.apply(Math, fpsRef.current.slice(0, 3))
            : 0,
        ...cbData,
      });

    if (start) {
      if (stopInfo[1] && stopInfo[0] === counterTimeRef.current) {
        delayStop();
        return;
      }
      counterTimeRef.current++;
    }
    if (stop) {
      counterTimeRef.current = 0;
    }
  }, [clock, start, stop]);

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
        counter: counterTimeRef.current,
        fps: 0,
        ...cbData,
      });
    }

    if (stop) {
      cancelAnimationFrame(timerRef.current);
      actionReset();
    }
    return () => cancelAnimationFrame(timerRef.current);
  }, [start, stop]);

  return [start, pause, actionStart, actionStop];
};
