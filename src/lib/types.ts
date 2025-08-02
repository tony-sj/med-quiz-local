export interface QuizQuestion {
	question: string;
	answer: string;
}

export interface Quiz {
	title: string;
	grade: string;
	questions: QuizQuestion[];
}

export interface QuizResult {
	totalQuestions: number;
	correctAnswers: number;
	score: number;
	answers: {
		question: string;
		userAnswer: string;
		correctAnswer: string;
		isCorrect: boolean;
	}[];
}

export type QuizMode = 'immediate' | 'complete';

export interface QuizSettings {
	mode: QuizMode;
	shuffleQuestions: boolean;
}

export interface QuizMetadata {
	filename: string;
	title: string;
	grade: string;
}
