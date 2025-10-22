
import React, { useState, useCallback } from 'react';
import { GameState, Question, GameConfig } from './types';
import SetupScreen from './components/SetupScreen';
import LoadingScreen from './components/LoadingScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateTriviaImage, generateTriviaQuestions } from './services/geminiService';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const startGame = useCallback(async (config: GameConfig) => {
        setGameState('loading');
        setError(null);
        setGameConfig(config);
        setScore(0);

        try {
            const [image, questionsData] = await Promise.all([
                generateTriviaImage(config.topic),
                generateTriviaQuestions(config)
            ]);

            setGeneratedImage(image);
            setQuestions(questionsData);
            setGameState('playing');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            setGameState('setup');
        }
    }, []);

    const handleGameEnd = useCallback((finalScore: number) => {
        setScore(finalScore);
        setGameState('results');
    }, []);

    const handleRestart = useCallback(() => {
        setGameState('setup');
        setGameConfig(null);
        setQuestions([]);
        setGeneratedImage(null);
        setError(null);
        setScore(0);
    }, []);
    
    const renderContent = () => {
        switch (gameState) {
            case 'setup':
                return <SetupScreen onStartGame={startGame} error={error} />;
            case 'loading':
                return <LoadingScreen topic={gameConfig?.topic || 'your topic'} />;
            case 'playing':
                if (!gameConfig || questions.length === 0 || !generatedImage) {
                    // This should not happen, but as a fallback
                    handleRestart();
                    return null;
                }
                return (
                    <GameScreen
                        questions={questions}
                        gameImage={generatedImage}
                        topic={gameConfig.topic}
                        onGameEnd={handleGameEnd}
                    />
                );
            case 'results':
                return <ResultsScreen score={score} totalQuestions={questions.length} onRestart={handleRestart} />;
            default:
                return <SetupScreen onStartGame={startGame} error={error} />;
        }
    };

    return (
        <div className="min-h-screen bg-light font-sans flex flex-col items-center justify-center p-4">
            <header className="text-center mb-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-primary">AI Trivia Quest</h1>
                <p className="text-secondary text-lg mt-2">Challenge Your Knowledge on Any Topic!</p>
            </header>
            <main className="w-full max-w-2xl">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
