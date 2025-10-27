import React, { useEffect } from 'react';
import { GameResults } from '../types';

interface ResultsScreenProps {
    results: GameResults;
    totalQuestions: number;
    onRestart: () => void;
}

declare var confetti: any;

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, totalQuestions, onRestart }) => {
    const { score, correctAnswers } = results;

    useEffect(() => {
        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        if (percentage < 50 || typeof confetti === 'undefined') {
            return;
        }

        const celebrationType = Math.random() < 0.5 ? 'confetti' : 'fireworks';
        const themeColors = ['#1e40af', '#3b82f6', '#f97316', '#ffffff'];

        if (celebrationType === 'confetti') {
            const duration = 2 * 1000;
            const animationEnd = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: themeColors
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: themeColors
                });

                if (Date.now() < animationEnd) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        } else { // fireworks
            const launchFirework = () => {
                const origin = { x: Math.random(), y: Math.random() - 0.2 };
                const defaults = {
                    origin,
                    spread: 360,
                    ticks: 80,
                    gravity: 0.8,
                    decay: 0.96,
                    startVelocity: 25,
                    shapes: ['star' as const],
                    colors: themeColors
                };

                confetti({ ...defaults, particleCount: 50, scalar: 1.2 });
                confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ['circle' as const] });
            };

            setTimeout(launchFirework, 0);
            setTimeout(launchFirework, 300);
            setTimeout(launchFirework, 600);
        }

    }, [correctAnswers, totalQuestions]);


    const getResultMessage = () => {
        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        if (percentage === 100) return "Perfect Score! You're a trivia legend!";
        if (percentage >= 80) return "Excellent! You're a trivia master!";
        if (percentage >= 50) return "Great job! A very solid performance.";
        if (percentage >= 20) return "Good effort! Keep practicing.";
        return "Nice try! Every game is a learning experience.";
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full text-center animate-slide-in-up">
            <h2 className="text-3xl font-bold text-primary mb-2">Game Over!</h2>
            <p className="text-lg text-gray-600 mb-6">{getResultMessage()}</p>
            
            <div className="bg-light p-6 rounded-lg mb-8 space-y-4">
                <div>
                    <p className="text-xl text-gray-700">Your Final Score</p>
                    <p className="text-6xl font-bold text-accent my-2">{score}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center border-t border-gray-200 pt-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Correct Answers</p>
                        <p className="text-2xl font-bold text-primary">{correctAnswers} / {totalQuestions}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Score / Q</p>
                        <p className="text-2xl font-bold text-primary">{Math.round(totalQuestions > 0 ? score / totalQuestions : 0)}</p>
                    </div>
                </div>
            </div>
            
            <button
                onClick={onRestart}
                className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105"
            >
                Play Again
            </button>
        </div>
    );
};

export default ResultsScreen;
