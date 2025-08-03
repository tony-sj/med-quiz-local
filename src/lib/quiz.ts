import Papa from 'papaparse';
import type { QuizQuestion, Quiz, QuizMetadata } from './types.js';

// 퀴즈 캐시
const quizCache = new Map<string, { quiz: Quiz; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10분

export async function loadQuizFromCSV(quizFolderName: string, enableImages: boolean = true): Promise<Quiz> {
	// 캐시 키에 이미지 설정 포함
	const cacheKey = `${quizFolderName}_images_${enableImages}`;
	const cached = quizCache.get(cacheKey);
	if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
		return cached.quiz;
	}

	try {
		// 새로운 폴더 구조: /quizzes/{folderName}/{folderName}.csv
		const response = await fetch(`/quizzes/${quizFolderName}/${quizFolderName}.csv`, {
			cache: 'force-cache' // 브라우저 캐시 활용
		});
		
		if (!response.ok) {
			throw new Error(`퀴즈 파일을 불러올 수 없습니다: ${response.status}`);
		}
		
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
		const title = rows[0][0] || quizFolderName.replace('_quiz', '').replace('_', ' ');
		const grade = rows[0][1] || 'M1';

		// 두 번째 행부터 문제와 정답 (첫 번째 행은 "문제,정답" 헤더)
		const questions: QuizQuestion[] = rows.slice(2).map((row: any) => {
			const question: QuizQuestion = {
				question: row[0] || '',
				answer: row[1] || ''
			};
			
			// 세 번째 열이 있으면 이미지 파일명으로 처리 (퀴즈 폴더 내 상대 경로)
			if (row[2] && row[2].trim()) {
				// 이미지 경로를 퀴즈 폴더 기준으로 설정
				question.image = `${quizFolderName}/${row[2].trim()}`;
			}
			
			return question;
		}).filter((q: QuizQuestion) => {
			// 기본 필터링: 질문과 답변이 있는지 확인
			if (!q.question || !q.answer) return false;
			
			// 이미지 설정에 따른 필터링
			if (!enableImages && q.image) return false;
			
			return true;
		});

		const quiz: Quiz = {
			title,
			grade,
			questions
		};
		
		// 캐시에 저장
		quizCache.set(cacheKey, { quiz, timestamp: Date.now() });
		
		return quiz;
	} catch (error) {
		console.error('퀴즈 로드 오류:', error);
		throw new Error('퀴즈를 로드할 수 없습니다.');
	}
}

export async function getAvailableQuizzes(): Promise<QuizMetadata[]> {
	try {
		// 새로운 폴더 구조: 각 퀴즈는 자체 폴더를 가짐
		const knownQuizFolders = [
			'm1_sample_quiz',
			'm1_anatomy_quiz', 
			'm2_neurology_quiz',
			'm2_pathology_quiz',
			'm3_respiratory_quiz',
			'm4_clinical_quiz'
		];
		
		// 실제로 존재하는 퀴즈 폴더들만 필터링하고 메타데이터 로드
		const availableQuizzes: QuizMetadata[] = [];
		for (const folderName of knownQuizFolders) {
			try {
				const response = await fetch(`/quizzes/${folderName}/${folderName}.csv`, { method: 'HEAD' });
				if (response.ok) {
					// CSV 파일에서 제목과 학년 정보 추출
					const quiz = await loadQuizFromCSV(folderName);
					availableQuizzes.push({
						filename: folderName,
						title: quiz.title,
						grade: quiz.grade
					});
				}
			} catch (error) {
				console.log(`퀴즈 폴더 ${folderName}를 찾을 수 없습니다.`);
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
