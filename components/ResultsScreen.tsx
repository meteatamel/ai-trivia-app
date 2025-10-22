
import React from 'react';

interface ResultsScreenProps {
    score: number;
    totalQuestions: number;
    onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, totalQuestions, onRestart }) => {
    const getResultMessage = () => {
        const percentage = totalQuestions > 0 ? (score / (totalQuestions * 100)) * 100 : 0;
        if (percentage >= 80) return "Excellent! You're a trivia master!";
        if (percentage >= 50) return "Great job! A very solid score.";
        if (percentage >= 20) return "Good effort! Keep practicing.";
        return "Nice try! Every game is a learning experience.";
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full text-center animate-slide-in-up">
            <h2 className="text-3xl font-bold text-primary mb-2">Game Over!</h2>
            <p className="text-lg text-gray-600 mb-6">{getResultMessage()}</p>
            
            <div className="bg-light p-6 rounded-lg mb-8">
                <p className="text-xl text-gray-700">Your Final Score</p>
                <p className="text-6xl font-bold text-accent my-2">{score}</p>
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
