<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { loadQuizFromCSV, shuffleArray, calculateScore } from '$lib/quiz.js';
	import type { Quiz, QuizResult, QuizMode } from '$lib/types.js';

	let quiz: Quiz | null = null;
	let currentQuestionIndex = 0;
	let userAnswers: string[] = [];
	let isLoading = true;
	let isQuizCompleted = false;
	let quizResult: QuizResult | null = null;
	let userAnswer = '';
	let quizMode: QuizMode = 'complete';
	let shuffleQuestions = true;
	let showFeedback = false;
	let currentFeedback: { isCorrect: boolean; correctAnswer: string } | null = null;

	onMount(async () => {
		const filename = $page.url.searchParams.get('file');
		quizMode = ($page.url.searchParams.get('mode') as QuizMode) || 'complete';
		shuffleQuestions = $page.url.searchParams.get('shuffle') !== 'false';
		
		if (!filename) {
			window.location.href = '/';
			return;
		}

		try {
			quiz = await loadQuizFromCSV(filename);
			if (shuffleQuestions) {
				quiz.questions = shuffleArray(quiz.questions);
			}
			userAnswers = new Array(quiz.questions.length).fill('');
			isLoading = false;
		} catch (error) {
			console.error('퀴즈 로드 실패:', error);
			alert('퀴즈를 로드할 수 없습니다.');
			window.location.href = '/';
		}
	});

	function checkAnswer() {
		if (!quiz) return;
		
		const question = quiz.questions[currentQuestionIndex];
		const isCorrect = userAnswer.toLowerCase().trim() === 
			question.answer.toLowerCase().trim();
		
		userAnswers[currentQuestionIndex] = userAnswer.trim();
		
		if (quizMode === 'immediate') {
			currentFeedback = {
				isCorrect,
				correctAnswer: question.answer
			};
			showFeedback = true;
		} else {
			nextQuestion();
		}
	}

	function nextQuestion() {
		if (!quiz) return;
		
		showFeedback = false;
		currentFeedback = null;
		
		if (currentQuestionIndex < quiz.questions.length - 1) {
			currentQuestionIndex++;
			userAnswer = userAnswers[currentQuestionIndex] || '';
		} else {
			completeQuiz();
		}
	}

	function previousQuestion() {
		if (currentQuestionIndex > 0) {
			userAnswers[currentQuestionIndex] = userAnswer.trim();
			currentQuestionIndex--;
			userAnswer = userAnswers[currentQuestionIndex] || '';
			showFeedback = false;
			currentFeedback = null;
		}
	}

	function completeQuiz() {
		if (!quiz) return;
		
		userAnswers[currentQuestionIndex] = userAnswer.trim();
		
		let correctAnswers = 0;
		const answers = quiz.questions.map((question, index) => {
			const isCorrect = userAnswers[index].toLowerCase().trim() === 
				question.answer.toLowerCase().trim();
			if (isCorrect) correctAnswers++;
			
			return {
				question: question.question,
				userAnswer: userAnswers[index],
				correctAnswer: question.answer,
				isCorrect
			};
		});

		quizResult = {
			totalQuestions: quiz.questions.length,
			correctAnswers,
			score: calculateScore(quiz.questions.length, correctAnswers),
			answers
		};

		isQuizCompleted = true;
	}

	function restartQuiz() {
		if (!quiz) return;
		
		currentQuestionIndex = 0;
		userAnswers = new Array(quiz.questions.length).fill('');
		userAnswer = '';
		isQuizCompleted = false;
		quizResult = null;
		showFeedback = false;
		currentFeedback = null;
		if (shuffleQuestions) {
			quiz.questions = shuffleArray(quiz.questions);
		}
	}

	function goHome() {
		window.location.href = '/';
	}

	$: progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
</script>

{#if isLoading}
	<div class="card">
		<div class="loading">
			<p>퀴즈를 로딩 중입니다...</p>
		</div>
	</div>
{:else if isQuizCompleted && quizResult}
	<div class="card">
		<h2>퀴즈 완료!</h2>
		<div class="result-summary">
			<div class="score-circle">
				<span class="score">{quizResult.score}점</span>
			</div>
			<p>
				총 {quizResult.totalQuestions}문제 중 {quizResult.correctAnswers}문제를 맞혔습니다.
			</p>
		</div>
		
		<div class="results">
			<h3>상세 결과</h3>
			{#each quizResult.answers as answer, index}
				<div class="result-item {answer.isCorrect ? 'correct' : 'incorrect'}">
					<div class="question-number">{index + 1}</div>
					<div class="result-content">
						<div class="question">{answer.question}</div>
						<div class="answers">
							<div class="user-answer">
								<strong>내 답변:</strong> {answer.userAnswer || '(답변 없음)'}
							</div>
							<div class="correct-answer">
								<strong>정답:</strong> {answer.correctAnswer}
							</div>
						</div>
					</div>
					<div class="result-icon">
						<span class={answer.isCorrect ? 'icon-correct' : 'icon-incorrect'}>
							{answer.isCorrect ? '○' : '×'}
						</span>
					</div>
				</div>
			{/each}
		</div>
		
		<div class="actions">
			<button class="btn btn-secondary" onclick={goHome}>홈으로</button>
			<button class="btn" onclick={restartQuiz}>다시 풀기</button>
		</div>
	</div>
{:else if quiz}
	<div class="card">
		<div class="quiz-header">
			<h2>{quiz.title}</h2>
			<div class="progress-info">
				<span>문제 {currentQuestionIndex + 1} / {quiz.questions.length}</span>
			</div>
		</div>
		
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>
		
		<div class="question-section">
			<div class="question">
				<h3>{quiz.questions[currentQuestionIndex].question}</h3>
			</div>
			
			<div class="answer-section">
				<label for="answer">답변:</label>
				<input 
					id="answer"
					type="text" 
					bind:value={userAnswer} 
					class="input" 
					placeholder="답변을 입력하세요..."
					onkeypress={(e) => e.key === 'Enter' && !showFeedback && checkAnswer()}
					disabled={showFeedback}
				/>
			</div>

			{#if showFeedback && currentFeedback}
				<div class="feedback {currentFeedback.isCorrect ? 'correct' : 'incorrect'}">
					<div class="feedback-icon">
						{currentFeedback.isCorrect ? '✓' : '✗'}
					</div>
					<div class="feedback-content">
						<div class="feedback-result">
							{currentFeedback.isCorrect ? '정답입니다!' : '틀렸습니다.'}
						</div>
						{#if !currentFeedback.isCorrect}
							<div class="feedback-answer">
								정답: {currentFeedback.correctAnswer}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
		
		<div class="navigation">
			<button 
				class="btn btn-secondary" 
				onclick={previousQuestion}
				disabled={currentQuestionIndex === 0}
			>
				이전
			</button>
			
			{#if showFeedback}
				<button class="btn" onclick={nextQuestion}>
					{currentQuestionIndex === quiz.questions.length - 1 ? '완료' : '다음'}
				</button>
			{:else}
				<button class="btn" onclick={checkAnswer}>
					{quizMode === 'immediate' ? '답변 제출' : (currentQuestionIndex === quiz.questions.length - 1 ? '완료' : '다음')}
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.loading {
		text-align: center;
		padding: 3rem;
		color: #666;
	}
	
	.quiz-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.quiz-header h2 {
		color: #333;
		margin: 0;
	}
	
	.progress-info {
		color: #666;
		font-weight: 500;
	}
	
	.question-section {
		margin: 2rem 0;
	}
	
	.question h3 {
		color: #333;
		margin-bottom: 1.5rem;
		font-size: 1.2rem;
		line-height: 1.5;
	}
	
	.answer-section label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}
	
	.feedback {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.feedback.correct {
		background: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
	}
	
	.feedback.incorrect {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		color: #721c24;
	}
	
	.feedback-icon {
		font-size: 1.5rem;
		font-weight: bold;
	}
	
	.feedback-result {
		font-weight: 600;
		margin-bottom: 0.25rem;
	}
	
	.feedback-answer {
		font-size: 0.9rem;
	}
	
	.navigation {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	
	.navigation button {
		flex: 1;
		max-width: 150px;
	}
	
	.result-summary {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.score-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem;
	}
	
	.score {
		color: white;
		font-size: 1.5rem;
		font-weight: bold;
	}
	
	.results h3 {
		color: #333;
		margin-bottom: 1rem;
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 0.5rem;
	}
	
	.result-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 8px;
		border: 2px solid #e9ecef;
	}
	
	.result-item.correct {
		border-color: #28a745;
		background: #f8fff8;
	}
	
	.result-item.incorrect {
		border-color: #dc3545;
		background: #fff8f8;
	}
	
	.question-number {
		background: #667eea;
		color: white;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}
	
	.result-content {
		flex: 1;
	}
	
	.result-content .question {
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #333;
	}
	
	.answers > div {
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
	}
	
	.user-answer {
		color: #666;
	}
	
	.correct-answer {
		color: #28a745;
	}
	
	.result-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}

	.icon-correct {
		background: #28a745;
		color: white;
	}

	.icon-incorrect {
		background: #dc3545;
		color: white;
	}
	
	.actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}
</style>
