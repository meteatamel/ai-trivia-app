import React, { useState, useEffect } from 'react';
import { Question, GameResults } from '../types';
import TimerBar from './TimerBar';
import { playCorrectSound, playIncorrectSound, playTimeUpSound } from '../services/soundService';

interface GameScreenProps {
    questions: Question[];
    gameImage: string;
    topic: string;
    onGameEnd: (results: GameResults) => void;
    timePerQuestion: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ questions, gameImage, topic, onGameEnd, timePerQuestion }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);

    const currentQuestion = questions[currentQuestionIndex];
    
    useEffect(() => {
        setTimeLeft(timePerQuestion);
    }, [currentQuestionIndex, timePerQuestion]);

    const advanceGame = (finalScore: number, finalCorrectAnswers: number) => {
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsPaused(false);
            } else {
                onGameEnd({ score: finalScore, correctAnswers: finalCorrectAnswers });
            }
        }, 1500); // Wait 1.5 seconds to show feedback
    };

    const handleAnswerClick = (option: string) => {
        if (selectedAnswer) return; // Prevent multiple clicks

        setIsPaused(true);
        setSelectedAnswer(option);

        if (option === currentQuestion.answer) {
            playCorrectSound();
            const points = Math.round((timeLeft / timePerQuestion) * 100);
            const newScore = score + points;
            const newCorrectAnswers = correctAnswers + 1;
            setScore(newScore);
            setCorrectAnswers(newCorrectAnswers);
            advanceGame(newScore, newCorrectAnswers);
        } else {
            playIncorrectSound();
            // Wrong answer, advance with current score
            advanceGame(score, correctAnswers);
        }
    };

    const handleTimeUp = () => {
        setIsPaused(true);
        setSelectedAnswer(''); // Indicate time ran out
        playTimeUpSound();
        // Time's up, advance with current score
        advanceGame(score, correctAnswers);
    };

    const getButtonClass = (option: string) => {
        if (!selectedAnswer) {
            return 'bg-secondary hover:bg-blue-600';
        }

        const isCorrect = option === currentQuestion.answer;
        const isSelected = option === selectedAnswer;

        let animationClass = '';
        if (isCorrect) {
            animationClass = 'animate-pop';
        } else if (isSelected && !isCorrect) {
            animationClass = 'animate-shake';
        }

        if (isCorrect) return `bg-green-500 ${animationClass}`;
        if (isSelected && !isCorrect) return `bg-red-500 ${animationClass}`;
        
        return 'bg-gray-400';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-bold text-primary">Score: {score}</div>
                <div className="text-lg font-semibold text-gray-700">Question {currentQuestionIndex + 1} / {questions.length}</div>
            </div>
            
            <TimerBar 
                key={currentQuestionIndex} 
                onTimeUp={handleTimeUp} 
                isPaused={isPaused} 
                onTick={setTimeLeft}
                duration={timePerQuestion}
            />
            
            <img src={gameImage} alt={topic} className="w-full h-48 object-cover rounded-lg mb-4 shadow-md" />

            <div className="text-center mb-6 min-h-[96px] flex items-center justify-center">
                 <p 
                    key={currentQuestionIndex}
                    className="text-xl md:text-2xl font-semibold text-gray-800 animate-fade-in" 
                    dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                ></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerClick(option)}
                        disabled={!!selectedAnswer}
                        className={`p-4 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none ${getButtonClass(option)}`}
                        dangerouslySetInnerHTML={{ __html: option }}
                    >
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameScreen;