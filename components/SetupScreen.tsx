import React, { useState, useEffect } from 'react';
import { PRESET_TOPICS, LANGUAGES, DEFAULT_NUM_QUESTIONS, DEFAULT_DIFFICULTY, DEFAULT_LANGUAGE, RANDOM_TOPIC, DEFAULT_QUESTION_TIMER_SECONDS, TIME_PER_QUESTION_OPTIONS } from '../constants';
import { GameConfig, Difficulty } from '../types';
import { generateRandomTopic } from '../services/geminiService';

interface SetupScreenProps {
    onStartGame: (config: GameConfig) => void;
    error: string | null;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, error: initialError }) => {
    const [topic, setTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [randomTopicValue, setRandomTopicValue] = useState('');
    const [numQuestions, setNumQuestions] = useState(DEFAULT_NUM_QUESTIONS);
    const [timePerQuestion, setTimePerQuestion] = useState(DEFAULT_QUESTION_TIMER_SECONDS);
    const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [isTopicLoading, setIsTopicLoading] = useState(false);
    const [error, setError] = useState<string | null>(initialError);

    useEffect(() => {
        setError(initialError);
    }, [initialError]);
    
    const fetchAndSetRandomTopic = async () => {
        setIsTopicLoading(true);
        setError(null);
        try {
            const newTopic = await generateRandomTopic();
            setRandomTopicValue(newTopic);
        } catch (err) {
             setError("Failed to generate a random topic. Please try refreshing or pick one from the list.");
             setRandomTopicValue(''); // Clear on error to allow retry
        } finally {
            setIsTopicLoading(false);
        }
    };

    const handleTopicChange = (selectedTopic: string) => {
        setTopic(selectedTopic);
        // If user selects random for the first time and the input is empty, fetch a topic
        if (selectedTopic === RANDOM_TOPIC && !randomTopicValue) {
            fetchAndSetRandomTopic();
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        let finalTopic = topic;
        if (topic === 'Other') {
            finalTopic = customTopic;
        } else if (topic === RANDOM_TOPIC) {
            finalTopic = randomTopicValue;
        }

        if (!finalTopic || !finalTopic.trim()) {
            setError("Please ensure a topic is selected or entered.");
            return;
        }
        
        onStartGame({
            topic: finalTopic,
            numQuestions,
            difficulty,
            language,
            timePerQuestion,
        });
    };
    
    const isStartDisabled = isTopicLoading ||
        (topic === 'Other' && !customTopic.trim()) ||
        (topic === RANDOM_TOPIC && !randomTopicValue.trim()) ||
        !topic;

    const countryCodeToEmoji = (code: string) => {
        const offset = 127397; // Unicode Regional Indicator Symbol Letter A - 'A'.charCodeAt(0)
        if (!code || code.length !== 2) return '';
        return String.fromCodePoint(...code.toUpperCase().split('').map(char => char.charCodeAt(0) + offset));
    };


    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full animate-slide-in-up">
            <h2 className="text-2xl font-bold text-center text-primary mb-6">Create Your Game</h2>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
                    <p className="font-bold">Oops!</p>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <select
                        id="topic"
                        value={topic}
                        onChange={(e) => handleTopicChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                    >
                        <option value="" disabled>Select a topic</option>
                        {PRESET_TOPICS.map(t => <option key={t.name} value={t.name}>{t.emoji} {t.name}</option>)}
                        <option value="Other">✍️ Custom Topic</option>
                        <option value={RANDOM_TOPIC}>🎲 {RANDOM_TOPIC}</option>
                    </select>
                </div>

                {topic === 'Other' && (
                    <div className="animate-fade-in">
                        <input
                            type="text"
                            id="custom-topic"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="e.g., The Roman Empire"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                            aria-label="Custom Topic"
                        />
                    </div>
                )}

                {topic === RANDOM_TOPIC && (
                    <div className="animate-fade-in">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="random-topic-input"
                                value={isTopicLoading ? 'Figuring out a random topic...' : randomTopicValue}
                                placeholder="A random topic will appear here"
                                className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white disabled:bg-gray-100"
                                disabled
                                aria-label="Generated Random Topic"
                            />
                            <button
                                type="button"
                                onClick={fetchAndSetRandomTopic}
                                disabled={isTopicLoading}
                                className="flex-shrink-0 p-3 bg-secondary text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-wait"
                                aria-label="Generate new random topic"
                            >
                                {isTopicLoading ? (
                                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0M6.812 6.812a8.25 8.25 0 0 1 11.664 0m0 0-3.181 3.183m-3.181-3.183-4.992 4.993" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                        <input
                            type="number"
                            id="num-questions"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value, 10))))}
                            min="1"
                            max="20"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                        />
                    </div>
                     <div>
                        <label htmlFor="time-per-question" className="block text-sm font-medium text-gray-700 mb-1">Time per question</label>
                        <select
                            id="time-per-question"
                            value={timePerQuestion}
                            onChange={(e) => setTimePerQuestion(parseInt(e.target.value, 10))}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                        >
                            {TIME_PER_QUESTION_OPTIONS.map(time => <option key={time} value={time}>{time} seconds</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                        >
                            {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.name} value={lang.name}>
                                {countryCodeToEmoji(lang.flagCode)} {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isStartDisabled}
                    className="w-full bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    Start
                </button>
            </form>
        </div>
    );
};

export default SetupScreen;