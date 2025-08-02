import Papa from 'papaparse';
import type { QuizQuestion, Quiz, QuizMetadata } from './types.js';

export async function loadQuizFromCSV(filename: string): Promise<Quiz> {
	try {
		const response = await fetch(`/quizzes/${filename}`);
		const csvText = await response.text();
		
		const parseResult = Papa.parse<any>(csvText, {
			header: false,
			skipEmptyLines: true
		});

		if (parseResult.errors && parseResult.errors.length > 0) {
			console.error('CSV 파싱 오류:', parseResult.errors);
		}

		const rows = parseResult.data;
		if (rows.length < 3) {
			throw new Error('CSV 파일 형식이 올바르지 않습니다.');
		}

		// 첫 번째 행에서 제목과 학년 정보 추출
		const title = rows[0][0] || filename.replace('.csv', '');
		const grade = rows[0][1] || 'M1';

		// 두 번째 행부터 문제와 정답 (첫 번째 행은 "문제,정답" 헤더)
		const questions: QuizQuestion[] = rows.slice(2).map((row: any) => ({
			question: row[0] || '',
			answer: row[1] || ''
		})).filter((q: QuizQuestion) => q.question && q.answer);

		return {
			title,
			grade,
			questions
		};
	} catch (error) {
		console.error('퀴즈 로드 오류:', error);
		throw new Error('퀴즈를 로드할 수 없습니다.');
	}
}

export async function getAvailableQuizzes(): Promise<QuizMetadata[]> {
	try {
		// 실제 배포 환경에서는 API 엔드포인트를 통해 가져와야 합니다
		// 현재는 알려진 퀴즈 파일들을 반환
		const knownQuizzes = [
			'm1_sample_quiz.csv',
			'm2_neurology_quiz.csv',
			'm2_pathology_quiz.csv',
			'm3_respiratory_quiz.csv',
			'm4_clinical_quiz.csv'
		];
		
		// 실제로 존재하는 파일들만 필터링하고 메타데이터 로드
		const availableQuizzes: QuizMetadata[] = [];
		for (const filename of knownQuizzes) {
			try {
				const response = await fetch(`/quizzes/${filename}`, { method: 'HEAD' });
				if (response.ok) {
					// CSV 파일에서 제목과 학년 정보 추출
					const quiz = await loadQuizFromCSV(filename);
					availableQuizzes.push({
						filename,
						title: quiz.title,
						grade: quiz.grade
					});
				}
			} catch (error) {
				console.log(`퀴즈 파일 ${filename}를 찾을 수 없습니다.`);
			}
		}
		
		return availableQuizzes.length > 0 ? availableQuizzes : [];
	} catch (error) {
		console.error('퀴즈 목록 로드 오류:', error);
		return [];
	}
}

export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function calculateScore(totalQuestions: number, correctAnswers: number): number {
	return Math.round((correctAnswers / totalQuestions) * 100);
}
