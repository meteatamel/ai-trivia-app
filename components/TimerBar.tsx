
import React, { useState, useEffect } from 'react';
import { QUESTION_TIMER_SECONDS } from '../constants';

interface TimerBarProps {
  onTimeUp: () => void;
  isPaused: boolean;
  onTick: (timeLeft: number) => void;
  key: number; // To reset the timer when the question changes
}

const TimerBar: React.FC<TimerBarProps> = ({ onTimeUp, isPaused, onTick, key }) => {
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_SECONDS);

  useEffect(() => {
    setTimeLeft(QUESTION_TIMER_SECONDS);
  }, [key]);

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
  }, [timeLeft, isPaused, onTimeUp, onTick]);

  const percentage = (timeLeft / QUESTION_TIMER_SECONDS) * 100;
  
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
