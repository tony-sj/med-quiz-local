export interface QuizQuestion {
	question: string;
	answer: string;
	image?: string; // 이미지 URL (선택적)
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
		timeSpent?: number; // 각 문제에 소요된 시간 (초)
	}[];
	totalTimeSpent?: number; // 전체 소요 시간 (초)
}

export type QuizMode = 'immediate' | 'complete';

export interface QuizSettings {
	mode: QuizMode;
	shuffleQuestions: boolean;
	timeLimit?: number; // 문제당 제한 시간 (초), undefined면 무제한
	enableImages: boolean; // 이미지 표시 여부
}

export interface QuizMetadata {
	filename: string;
	title: string;
	grade: string;
}
