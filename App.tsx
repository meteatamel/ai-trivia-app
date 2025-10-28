import React, { useState, useCallback } from 'react';
import { GameState, Question, GameConfig, GameResults } from './types';
import SetupScreen from './components/SetupScreen';
import LoadingScreen from './components/LoadingScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateTriviaImage, generateTriviaQuestions } from './services/geminiService';
import { generateThemeFromImage } from './services/colorService';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [results, setResults] = useState<GameResults>({ score: 0, correctAnswers: 0 });
    const [error, setError] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState<string>('#f0f9ff');

    const startGame = useCallback(async (config: GameConfig) => {
        setGameState('loading');
        setError(null);
        setGameConfig(config);
        setResults({ score: 0, correctAnswers: 0 });

        try {
            const [image, questionsData] = await Promise.all([
                generateTriviaImage(config.topic),
                generateTriviaQuestions(config)
            ]);

            generateThemeFromImage(image).then(color => {
                setBackgroundColor(color);
            });

            setGeneratedImage(image);
            setQuestions(questionsData);
            setGameState('playing');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            setGameState('setup');
            setBackgroundColor('#f0f9ff'); // Reset on error
        }
    }, []);

    const handleGameEnd = useCallback((finalResults: GameResults) => {
        setResults(finalResults);
        setGameState('results');
    }, []);

    const handleRestart = useCallback(() => {
        setGameState('setup');
        setGameConfig(null);
        setQuestions([]);
        setGeneratedImage(null);
        setError(null);
        setResults({ score: 0, correctAnswers: 0 });
        setBackgroundColor('#f0f9ff');
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
                        timePerQuestion={gameConfig.timePerQuestion}
                    />
                );
            case 'results':
                return <ResultsScreen results={results} totalQuestions={questions.length} onRestart={handleRestart} />;
            default:
                return <SetupScreen onStartGame={startGame} error={error} />;
        }
    };

    return (
        <div
            className="min-h-screen font-sans flex flex-col items-center justify-center p-4 transition-colors duration-1000"
            style={{ backgroundColor: backgroundColor }}
        >
            <header className="text-center mb-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-primary">AI Trivia Quest</h1>
                <p className="text-secondary text-lg mt-2">Challenge your knowledge on any topic</p>
            </header>
            <main className="w-full max-w-2xl">
                {renderContent()}
            </main>
            <footer className="text-center mt-8 text-gray-500 text-sm animate-fade-in">
                Vibe coded by <a href="https://www.linkedin.com/in/meteatamel/" target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary hover:underline">Mete Atamel</a>
                <span className="mx-2">|</span>
                <a href="https://github.com/meteatamel/ai-trivia-app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary hover:underline">GitHub repo</a>
            </footer>
        </div>
    );
};

export default App;