import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Question, GameConfig, GameResults } from './types';
import SetupScreen from './components/SetupScreen';
import LoadingScreen from './components/LoadingScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { generateTriviaImage, generateTriviaQuestions } from './services/geminiService';
import { generateThemeFromImage } from './services/colorService';

// Define the type for the BeforeInstallPromptEvent which is not a standard DOM event type
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [results, setResults] = useState<GameResults>({ score: 0, correctAnswers: 0 });
    const [error, setError] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState<string>('#f0f9ff');
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPromptEvent(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            // Hide the install prompt button if the app is installed
            setInstallPromptEvent(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    
    const handleInstallClick = async () => {
        if (!installPromptEvent) {
            return;
        }
        await installPromptEvent.prompt();
        // Wait for the user to respond to the prompt
        await installPromptEvent.userChoice;
        // We've used the prompt, and can't use it again, throw it away
        setInstallPromptEvent(null);
    };

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
            className="relative min-h-screen font-sans flex flex-col items-center justify-center p-4 transition-colors duration-1000"
            style={{ backgroundColor: backgroundColor }}
        >
             {installPromptEvent && (
                <button
                    onClick={handleInstallClick}
                    className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 animate-fade-in"
                    title="Install AI Trivia Quest"
                    aria-label="Install AI Trivia Quest"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Install</span>
                </button>
            )}

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
