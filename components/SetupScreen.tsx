import React, { useState } from 'react';
import { PRESET_TOPICS, LANGUAGES, DEFAULT_NUM_QUESTIONS, DEFAULT_DIFFICULTY, DEFAULT_LANGUAGE } from '../constants';
import { GameConfig, Difficulty } from '../types';

interface SetupScreenProps {
    onStartGame: (config: GameConfig) => void;
    error: string | null;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, error }) => {
    const [topic, setTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(DEFAULT_NUM_QUESTIONS);
    const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalTopic = topic === 'Other' ? customTopic : topic;
        if (!finalTopic) return;
        onStartGame({
            topic: finalTopic,
            numQuestions,
            difficulty,
            language,
        });
    };
    
    const isStartDisabled = (topic === 'Other' && !customTopic.trim()) || (topic !== 'Other' && !topic);

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
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                    >
                        <option value="" disabled>Select a topic</option>
                        {PRESET_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="Other">Other (Custom)</option>
                    </select>
                </div>

                {topic === 'Other' && (
                    <div className="animate-fade-in">
                        <label htmlFor="custom-topic" className="block text-sm font-medium text-gray-700 mb-1">Custom Topic</label>
                        <input
                            type="text"
                            id="custom-topic"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="e.g., The Roman Empire"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-white"
                        />
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Start Trivia Quest
                </button>
            </form>
        </div>
    );
};

export default SetupScreen;