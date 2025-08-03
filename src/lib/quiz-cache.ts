import Papa from 'papaparse';
import type { QuizMetadata } from './types.js';

// 캐시된 메타데이터 및 상태
let cachedMetadata: QuizMetadata[] | null = null;
let metadataTimestamp = 0;
let quizzesFileLastModified = '';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 폴백용 기본 메타데이터 (quizzes.csv 로드 실패 시)
const FALLBACK_METADATA: QuizMetadata[] = [
	{ filename: 'm1_sample_quiz', title: '순환기 기초', grade: 'M1' },
	{ filename: 'm1_anatomy_quiz', title: '해부학 기초', grade: 'M1' },
	{ filename: 'm2_neurology_quiz', title: '신경계학', grade: 'M2' },
	{ filename: 'm2_pathology_quiz', title: '병리학 기초', grade: 'M2' }
];

/**
 * 동적 메타데이터 로드 (quizzes.csv 기반)
 */
export async function getFastQuizMetadata(): Promise<QuizMetadata[]> {
	const now = Date.now();
	
	// 1. 캐시가 유효하면 반환
	if (cachedMetadata && (now - metadataTimestamp) < CACHE_DURATION) {
		return cachedMetadata;
	}
	
	try {
		// 2. quizzes.csv 파일의 Last-Modified 확인
		const metaResponse = await fetch('/quizzes.csv', { 
			method: 'HEAD', 
			cache: 'no-cache' 
		});
		
		const currentLastModified = metaResponse.headers.get('last-modified') || '';
		
		// 3. 파일이 변경되지 않았고 캐시가 있으면 캐시 반환
		if (cachedMetadata && currentLastModified === quizzesFileLastModified) {
			return cachedMetadata;
		}
		
		// 4. quizzes.csv 파일 로드
		const csvResponse = await fetch('/quizzes.csv', { 
			cache: 'force-cache' 
		});
		
		if (!csvResponse.ok) {
			throw new Error(`quizzes.csv 파일을 찾을 수 없습니다: ${csvResponse.status}`);
		}
		
		const csvText = await csvResponse.text();
		const parseResult = Papa.parse<any>(csvText, {
			header: true,
			skipEmptyLines: true
		});
		
		if (parseResult.errors.length > 0) {
			console.warn('quizzes.csv 파싱 경고:', parseResult.errors);
		}
		
		// 5. CSV 데이터를 메타데이터로 변환
		const metadata: QuizMetadata[] = parseResult.data
			.filter((row: any) => row.folder_name && row.title && row.grade)
			.map((row: any) => ({
				filename: row.folder_name,
				title: row.title,
				grade: row.grade
			}));
		
		// 6. 백그라운드에서 실제 파일 존재 여부 검증
		const validatedMetadata = await validateQuizzesExistence(metadata);
		
		// 7. 캐시 업데이트
		cachedMetadata = validatedMetadata;
		metadataTimestamp = now;
		quizzesFileLastModified = currentLastModified;
		
		return validatedMetadata;
		
	} catch (error) {
		console.error('동적 메타데이터 로드 실패, 폴백 사용:', error);
		
		// 8. 실패 시 폴백 메타데이터 사용
		cachedMetadata = FALLBACK_METADATA;
		metadataTimestamp = now;
		
		return FALLBACK_METADATA;
	}
}

/**
 * 백그라운드에서 실제 퀴즈 파일 존재 여부 검증
 */
async function validateQuizzesExistence(metadata: QuizMetadata[]): Promise<QuizMetadata[]> {
	const validationPromises = metadata.map(async (quiz) => {
		try {
			const response = await fetch(`/quizzes/${quiz.filename}/${quiz.filename}.csv`, { 
				method: 'HEAD',
				cache: 'force-cache'
			});
			return response.ok ? quiz : null;
		} catch {
			return null;
		}
	});
	
	const results = await Promise.all(validationPromises);
	const validQuizzes = results.filter((quiz): quiz is QuizMetadata => quiz !== null);
	
	// 유효하지 않은 퀴즈가 있으면 경고
	const invalidQuizzes = metadata.filter(
		quiz => !validQuizzes.some(valid => valid.filename === quiz.filename)
	);
	
	if (invalidQuizzes.length > 0) {
		console.warn('일부 퀴즈 파일을 찾을 수 없습니다:', invalidQuizzes.map(q => q.filename));
	}
	
	return validQuizzes;
}

/**
 * 특정 퀴즈의 유효성 확인
 */
export async function isQuizValid(folderName: string): Promise<boolean> {
	try {
		const response = await fetch(`/quizzes/${folderName}/${folderName}.csv`, { 
			method: 'HEAD',
			cache: 'force-cache'
		});
		return response.ok;
	} catch {
		return false;
	}
}
