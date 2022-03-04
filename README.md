# Frame Timer React Hook

> Timer hook with start, stop and pause behaviors as well as minFPS and stopInfo arguments. For animation purposes.

[![NPM](https://img.shields.io/npm/v/frame-timer-hook.svg)](https://www.npmjs.com/package/frame-timer-hook) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save frame-timer-hook
```

## API

```jsx
const cb = (data) => {
  const { time, fps, counter, setStart, setStop } = data;
  const { ms, s, m, h, d } = time;
};
const stopValue = 2250;
const stopAfterTime = true;
const clearTimerDelay = 1000;
const stopInfo = [stopValue, stopAfterTime, clearTimerDelay];
const [start, pause, setStart, setStop] = useFrameTimer(cb, minFps, stopInfo);
```

|                 | type      | Required | Description                                                                                                                                                                                                 |
| --------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cb              | `void`    | ✓        | callback function                                                                                                                                                                                           |
| time            | `object`  |          | time object                                                                                                                                                                                                 |
| ms, s, m, h, d  | `number`  |          | time object values                                                                                                                                                                                          |
| counter         | `number`  |          | timer amount of refreshing                                                                                                                                                                                  |
| setStart        | `void`    |          | method starting or resuming timer loop                                                                                                                                                                      |
| setStop         | `void`    |          | method stopping timer loop                                                                                                                                                                                  |
| start           | `boolean` |          | current timer start state                                                                                                                                                                                   |
| pause           | `boolean` |          | current timer pause state                                                                                                                                                                                   |
| minFps          | `number`  |          | minimum frames per second                                                                                                                                                                                   |
| stopInfo        | `array`   |          | stop info array                                                                                                                                                                                             |
| stopValue       | `number`  |          | depends on `stopAfterTime` takes the value of time in milliseconds or number of refresh counts (returned in `counter` variable)                                                                             |
| stopAfterTime   | `boolean` |          | if `stopAfterTime = true` timer will stop after miliseconds defined in `stopValue`. if `stopAfterTime = false` timer will stop after refresh counts (returned in `counter` variable) defined in `stopValue` |
| clearTimerDelay | `number`  |          | delay in milliseconds after which timer will reset                                                                                                                                                          |

## Usage

```jsx
import React, { useState } from "react";

import { useFrameTimer } from "frame-timer-hook";

const timeDefault = {
  ms: 0,
  s: 0,
  m: 0,
  h: 0,
  d: 0,
};

const Example = () => {
  const [timer, setTimer] = useState(timeDefault);
  const [fps, setFps] = useState(0);
  const [counter, setCounter] = useState(0);
  const [start, pause, setStart, setStop] = useFrameTimer(
    (data) => {
      setTimer(data.time);
      setFps(data.fps);
      setCounter(data.counter);
    },
    60,
    [2150, false, 2500]
  );

  return (
    <div className="App">
      <h1>Frame timer hook</h1>
      <p>
        Frame timer hook with <strong>start</strong>, <strong>stop</strong> and{" "}
        <strong>pause</strong> behaviors
        <br />
        as well as <strong>minFPS</strong> and <strong>stopTime</strong>{" "}
        arguments
      </p>

      <div className="container">
        <h3 className="time">
          {Math.floor(timer.ms)} ms <span className="frames"> | {fps} fps</span>
        </h3>
        <h4 className="timer">
          {timer.d}:{String(timer.h % 24).padStart(2, "0")}:
          {String(timer.m % 60).padStart(2, "0")}:
          {String(timer.s % 60).padStart(2, "0")}:
          {String(timer.ms % 1000).padStart(3, "0")} ms
        </h4>
        <h4 className="refreshing">Refreshing: {counter}</h4>

        <div className="buttons">
          <button onClick={setStart}>{start ? "Pause" : "Start"}</button>
          <button onClick={setStop} disabled={!pause && !start}>
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Demo

Try it on CodeSandbox [Frame Timer React Hook](https://codesandbox.io/s/frame-timer-hook-v-1-2-0-forked-x27wmc?file=/src/App.js)

## License

MIT © [ja-klaudiusz](https://github.com/ja-klaudiusz)
