import React, { useState, useEffect } from 'react';

interface TimerBarProps {
  onTimeUp: () => void;
  isPaused: boolean;
  onTick: (timeLeft: number) => void;
  key: number; // To reset the timer when the question changes
  duration: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ onTimeUp, isPaused, onTick, key, duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [key, duration]);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        onTick(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isPaused, onTimeUp, onTick, duration]);

  const percentage = (timeLeft / duration) * 100;
  
  const barColor = percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 my-4 shadow-inner">
      <div
        className={`h-4 rounded-full transition-all duration-1000 linear ${barColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default TimerBar;