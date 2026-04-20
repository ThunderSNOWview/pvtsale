import { useEffect, useRef, useState } from "react";

export type TCountdownState = {
  day: number;
  hour: number;
  minute: number;
  second: number;
  milisecond: number;
  total: number;
  completed: boolean;
  formatted: {
    day: string;
    hour: string;
    minute: string;
    second: string;
    milisecond: string;
  };
};

const padZero = (num: number, length: number = 2): string => {
  return num.toString().padStart(length, "0");
};

const constructCountdownState = (t: number) => {
  const total = Math.max(0, t - Date.now());

  const day = Math.floor(total / (24 * 60 * 60 * 1000));
  const hour = Math.floor(total / (60 * 60 * 1000)) % 24;
  const minute = Math.floor(total / (60 * 1000)) % 60;
  const second = Math.floor(total / 1000) % 60;
  const milisecond = Math.floor(total) % 1000;

  return {
    day,
    hour,
    minute,
    second,
    milisecond,
    total,
    completed: total == 0,
    formatted: {
      day: padZero(day, 2),
      hour: padZero(hour, 2),
      minute: padZero(minute, 2),
      second: padZero(second, 2),
      milisecond: padZero(milisecond, 2),
    },
  } as TCountdownState;
};

interface TimerCountdownProps {
  to?: number;
  events?: { onCompleted: () => void };
}

export default function useTimerCountdown({ to, events }: TimerCountdownProps) {
  const [state, setState] = useState<TCountdownState | undefined>(() => {
    if (to != undefined) return constructCountdownState(to);
    return undefined;
  });

  const timerIdRef = useRef<any>(0);

  useEffect(() => {
    if (to != undefined) {
      const tick = () => {
        const newState = constructCountdownState(to);
        setState(newState);
        if (newState?.completed) {
          clearInterval(timerIdRef.current);
          if (events?.onCompleted) events.onCompleted();
        }
      };

      tick();
      timerIdRef.current = setInterval(() => {
        tick();
      }, 1_000);

      return () => {
        clearInterval(timerIdRef.current);
      };
    } else {
      setState(undefined);
    }
  }, [to, events]);

  return state;
}
