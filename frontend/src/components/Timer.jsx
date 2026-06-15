import { useState, useEffect, useRef } from 'react';

export default function Timer({ timeLimit, onTimeUp }) {
  const [remaining, setRemaining] = useState(timeLimit);
  const called = useRef(false);

  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!called.current) {
            called.current = true;
            onTimeUp?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit, onTimeUp]);

  if (!timeLimit || timeLimit <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 60;

  return (
    <div className={`text-lg font-mono font-bold ${isLow ? 'text-red-400 animate-pulse' : 'text-zinc-300'}`}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
