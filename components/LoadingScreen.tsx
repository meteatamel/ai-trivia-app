
import React from 'react';

interface LoadingScreenProps {
    topic: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ topic }) => {
    return (
        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-lg w-full text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-secondary rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-primary mb-2">Generating Your Trivia...</h2>
            <p className="text-gray-600">The AI is crafting questions and an image for <span className="font-semibold text-secondary">{topic}</span>.</p>
            <p className="text-gray-600">Please wait a moment.</p>
        </div>
    );
};

export default LoadingScreen;
