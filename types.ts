
export type GameState = 'setup' | 'loading' | 'playing' | 'results';

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface GameConfig {
  topic: string;
  numQuestions: number;
  difficulty: Difficulty;
  language: string;
  timePerQuestion: number;
}

export interface GameResults {
  score: number;
  correctAnswers: number;
}