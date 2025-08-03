<script lang="ts">
	import { onMount } from 'svelte';
	import { loadQuizFromCSV, getAvailableQuizzes } from '$lib/quiz.js';
	import { getFastQuizMetadata } from '$lib/quiz-cache.js';
	import type { Quiz, QuizMode, QuizMetadata } from '$lib/types.js';

	// 상태 변수들
	let availableQuizzes: QuizMetadata[] = [];
	let selectedQuiz = '';
	let quizMode: QuizMode = 'complete';
	let shuffleQuestions = true;
	let isLoading = false;
	let selectedGradeFilter = 'all';
	let showSettingsModal = false;
	let isModalClosing = false;
	let timeLimit: number | undefined = undefined;
	let enableImages = true;

	// 최적화: 학년 옵션은 상수로 정의
	const gradeOptions = [
		{ value: 'all', label: '전체' },
		{ value: 'M1', label: 'M1' },
		{ value: 'M2', label: 'M2' },
		{ value: 'M3', label: 'M3' },
		{ value: 'M4', label: 'M4' },
		{ value: 'M5', label: 'M5' },
		{ value: 'M6', label: 'M6' }
	] as const;

	// 최적화: 메모화된 필터링된 퀴즈 목록
	$: filteredQuizzes = selectedGradeFilter === 'all' 
		? availableQuizzes 
		: availableQuizzes.filter(quiz => quiz.grade === selectedGradeFilter);

	// 최적화: 선택된 퀴즈 정보 메모화
	$: selectedQuizInfo = selectedQuiz 
		? availableQuizzes.find(quiz => quiz.filename === selectedQuiz)
		: null;

	onMount(async () => {
		try {
			// 빠른 초기 로딩 (정적 메타데이터 즉시 표시)
			availableQuizzes = await getFastQuizMetadata();
		} catch (error) {
			console.error('퀴즈 목록 로드 실패:', error);
			// 폴백으로 기존 방식 시도
			try {
				availableQuizzes = await getAvailableQuizzes();
			} catch (fallbackError) {
				console.error('폴백 로딩도 실패:', fallbackError);
			}
		}
	});

	function selectQuiz(quizFile: string) {
		selectedQuiz = quizFile;
		showSettingsModal = true;
	}

	function closeModal() {
		isModalClosing = true;
		setTimeout(() => {
			showSettingsModal = false;
			isModalClosing = false;
		}, 300); // 애니메이션 시간과 맞춤
	}

	async function startQuiz() {
		if (!selectedQuiz) return;
		
		isLoading = true;
		try {
			const quiz = await loadQuizFromCSV(selectedQuiz);
			// 퀴즈 설정과 함께 퀴즈 페이지로 이동
			const params = new URLSearchParams({
				file: selectedQuiz,
				mode: quizMode,
				shuffle: shuffleQuestions.toString(),
				timeLimit: timeLimit?.toString() || '',
				enableImages: enableImages.toString()
			});
			window.location.href = `/quiz?${params.toString()}`;
		} catch (error) {
			console.error('퀴즈 시작 실패:', error);
			alert('퀴즈를 시작할 수 없습니다. 다시 시도해주세요.');
		} finally {
			isLoading = false;
			showSettingsModal = false;
		}
	}

</script>

<div class="card">
	<h2>퀴즈 선택</h2>
	<p>학습하고 싶은 퀴즈를 선택하세요.</p>
	
	{#if availableQuizzes.length === 0}
		<div class="loading">
			<p>퀴즈를 로드하는 중...</p>
		</div>
	{:else}
		<div class="grade-filter">
			<label for="grade-select">학년 필터:</label>
			<select id="grade-select" bind:value={selectedGradeFilter} class="input">
				{#each gradeOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<div class="quiz-grid">
			{#each filteredQuizzes as quiz (quiz.filename)}
				<button 
					class="quiz-card"
					onclick={() => selectQuiz(quiz.filename)}
				>
					<div class="quiz-grade">{quiz.grade}</div>
					<div class="quiz-title">{quiz.title}</div>
					<div class="quiz-subtitle">의학 퀴즈</div>
				</button>
			{/each}
		</div>

		{#if filteredQuizzes.length === 0}
			<div class="no-quizzes">
				<p>선택한 학년에 해당하는 퀴즈가 없습니다.</p>
			</div>
		{/if}
	{/if}
</div>

<!-- 설정 모달 -->
{#if showSettingsModal}
	<div 
		class="modal-overlay {isModalClosing ? 'closing' : ''}" 
		role="button"
		tabindex="0"
		onclick={closeModal}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
	>
		<div 
			class="modal {isModalClosing ? 'closing' : ''}" 
			role="dialog"
			aria-modal="true"
			tabindex="0"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h2>퀴즈 설정</h2>
				<button class="close-btn" onclick={closeModal}>&times;</button>
			</div>
			
			<div class="modal-content">
				<div class="selected-quiz-info">
					{#if selectedQuizInfo}
						<div class="quiz-info-card">
							<div class="quiz-grade-badge">{selectedQuizInfo.grade}</div>
							<div class="quiz-title-large">{selectedQuizInfo.title}</div>
						</div>
					{/if}
				</div>

				<div class="settings-section">
					<h3>피드백 방식</h3>
					<div class="radio-group">
						<label class="radio-item">
							<input type="radio" bind:group={quizMode} value="immediate" />
							<span class="radio-label">즉시 피드백</span>
							<span class="radio-description">답변 후 바로 정답 확인</span>
						</label>
						<label class="radio-item">
							<input type="radio" bind:group={quizMode} value="complete" />
							<span class="radio-label">완료 후 피드백</span>
							<span class="radio-description">모든 문제를 푼 후 결과 확인</span>
						</label>
					</div>
				</div>

				<div class="settings-section">
					<h3>기타 설정</h3>
					<div class="settings-grid">
						<label class="checkbox-item">
							<input type="checkbox" bind:checked={shuffleQuestions} />
							<span class="checkbox-label">문제 순서 섞기</span>
						</label>
						
						<label class="checkbox-item">
							<input type="checkbox" bind:checked={enableImages} />
							<span class="checkbox-label">이미지 표시</span>
						</label>
					</div>
				</div>

				<div class="settings-section">
					<h3>시간 제한</h3>
					<div class="timer-settings">
						<label class="radio-item timer-option">
							<input 
								type="radio" 
								name="timerOption"
								checked={timeLimit === undefined}
								onchange={() => timeLimit = undefined}
							/>
							<span class="radio-label">무제한</span>
							<span class="radio-description">시간 제한 없이 풀기</span>
						</label>
						
						<label class="radio-item timer-option">
							<input 
								type="radio" 
								name="timerOption"
								checked={timeLimit === 30}
								onchange={() => timeLimit = 30}
							/>
							<span class="radio-label">30초</span>
							<span class="radio-description">문제당 30초 제한</span>
						</label>
						
						<label class="radio-item timer-option">
							<input 
								type="radio" 
								name="timerOption"
								checked={timeLimit === 60}
								onchange={() => timeLimit = 60}
							/>
							<span class="radio-label">1분</span>
							<span class="radio-description">문제당 1분 제한</span>
						</label>
						
						<label class="radio-item timer-option">
							<input 
								type="radio" 
								name="timerOption"
								checked={timeLimit === 120}
								onchange={() => timeLimit = 120}
							/>
							<span class="radio-label">2분</span>
							<span class="radio-description">문제당 2분 제한</span>
						</label>
					</div>
				</div>
			</div>
			
			<div class="modal-actions">
				<button class="btn btn-secondary" onclick={closeModal}>
					취소
				</button>
				<button 
					class="btn btn-primary" 
					onclick={startQuiz} 
					disabled={isLoading || !selectedQuiz}
				>
					{isLoading ? '로딩 중...' : '퀴즈 시작하기'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!--

<div class="card">
	<h2>사용 방법</h2>
	<ol>
		<li>CSV 파일을 <code>static/quizzes/</code> 폴더에 업로드하세요</li>
		<li>CSV 파일 형식:
			<ul>
				<li>첫 번째 행: 퀴즈 제목</li>
				<li>두 번째 행: "학년,M1" (또는 해당 학년)</li>
				<li>세 번째 행: "문제,정답" (헤더)</li>
				<li>네 번째 행부터: 실제 문제와 정답</li>
			</ul>
		</li>
		<li>파일명 앞에 학년 표시 (예: m1_anatomy.csv)</li>
		<li>위에서 퀴즈를 선택하고 설정을 조정하세요</li>
		<li>"퀴즈 시작하기" 버튼을 클릭하여 시작하세요</li>
	</ol>
</div>

-->

<style>
	h2 {
		color: #333;
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}
	
	h3 {
		color: #555;
		margin-bottom: 0.75rem;
		font-size: 1.1rem;
	}
	
	p {
		margin-bottom: 1.5rem;
		color: #666;
		line-height: 1.6;
	}
	
	.loading {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.grade-filter {
		margin-bottom: 1.5rem;
	}

	.grade-filter label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}
	
	.quiz-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}
	
	.quiz-card {
		background: #f8f9fa;
		border: 2px solid #e9ecef;
		border-radius: 12px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
		position: relative;
	}
	
	.quiz-card:hover {
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.quiz-grade {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: #667eea;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.quiz-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		margin-top: 1rem;
	}
	
	.quiz-subtitle {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.no-quizzes {
		text-align: center;
		padding: 2rem;
		color: #666;
		font-style: italic;
	}
	
	.settings-section {
		margin-bottom: 2rem;
	}
	
	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.radio-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
		padding: 1rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		transition: border-color 0.3s ease;
	}
	
	.radio-item:hover {
		border-color: #667eea;
	}
	
	.radio-item:has(input:checked) {
		border-color: #667eea;
		background: #f8f9ff;
	}
	
	.radio-item input {
		margin: 0;
	}
	
	.radio-label {
		font-weight: 500;
		color: #333;
	}
	
	.radio-description {
		display: block;
		font-size: 0.9rem;
		color: #666;
		margin-top: 0.25rem;
	}
	
	.checkbox-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		padding: 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		transition: border-color 0.3s ease;
	}
	
	.checkbox-item:hover {
		border-color: #667eea;
	}
	
	.checkbox-item:has(input:checked) {
		border-color: #667eea;
		background: #f8f9ff;
	}
	
	.checkbox-item input {
		margin: 0;
	}
	
	.checkbox-label {
		font-weight: 500;
		color: #333;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.timer-settings {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.timer-option {
		padding: 0.75rem;
		font-size: 0.9rem;
	}

	.timer-option .radio-label {
		font-size: 0.95rem;
	}

	.timer-option .radio-description {
		font-size: 0.8rem;
		margin-top: 0.1rem;
	}

	/* 모달 스타일 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.modal {
		background: white;
		border-radius: 16px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		animation: modalSlideIn 0.3s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(-30px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes modalSlideOut {
		from {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		to {
			opacity: 0;
			transform: translateY(-30px) scale(0.95);
		}
	}

	@keyframes overlayFadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	.modal-overlay.closing {
		animation: overlayFadeOut 0.3s ease-out forwards;
	}

	.modal.closing {
		animation: modalSlideOut 0.3s ease-out forwards;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.modal-header h2 {
		margin: 0;
		color: #333;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #f8f9fa;
		color: #333;
	}

	.modal-content {
		padding: 1.5rem;
	}

	.selected-quiz-info {
		margin-bottom: 2rem;
	}

	.quiz-info-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.5rem;
		border-radius: 12px;
		text-align: center;
		position: relative;
	}

	.quiz-grade-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.quiz-title-large {
		font-size: 1.3rem;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		padding: 1.5rem;
		border-top: 1px solid #e9ecef;
	}

	.btn-secondary {
		background: #f8f9fa;
		color: #333;
		border: 2px solid #e9ecef;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-secondary:hover {
		background: #e9ecef;
		border-color: #dee2e6;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0,0,0,0.2);
	}
	
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
</style>
