# 의학 퀴즈 (Med Quiz Local)

의대생을 위한 로컬 의학 퀴즈 웹 애플리케이션입니다. CSV 파일로 쉽게 문제를 추가할 수 있으며, 깔끔한 UI로 학습할 수 있습니다.

## 🚀 특징

- **간편한 문제 추가**: CSV 파일로 문제와 정답을 업로드
- **직관적인 퀴즈 선택**: 카드 버튼 형식의 퀴즈 선택 인터페이스
- **학년별 분류**: M1~M6 학년별 퀴즈 필터링 기능
- **한국어 제목 지원**: CSV 파일 내 한국어 퀴즈 제목 표시
- **유연한 피드백 모드**: 즉시 피드백 vs 완료 후 피드백 선택 가능
- **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능
- **실시간 피드백**: 퀴즈 완료 후 상세한 결과 확인
- **문제 섞기**: 매번 다른 순서로 문제 출제
- **깔끔한 UI**: 의료진을 위한 전문적이고 미니멀한 디자인

## 🛠️ 기술 스택

- **Frontend**: SvelteKit, TypeScript
- **CSS**: 순수 CSS (그라디언트, 애니메이션)
- **CSV 파싱**: Papa Parse
- **배포**: Vercel 지원
- **개발 도구**: ESLint, Prettier

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 애플리케이션을 확인할 수 있습니다.

### 3. 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 📝 CSV 파일 형식

`static/quizzes/` 폴더에 CSV 파일을 추가하면 자동으로 퀴즈로 인식됩니다.

### 파일 형식
```csv
순환기 기초,학년,M1
문제,정답
심장의 4개 방을 무엇이라고 하는가?,심방과 심실
혈액순환의 두 가지 종류는?,체순환과 폐순환
인체에서 가장 큰 동맥은?,대동맥
```

### 규칙
- **첫 번째 행**: 퀴즈 제목 (한국어로 직관적인 제목)
- **두 번째 행**: `학년,M1` 형식으로 해당 학년 표시 (M1~M6)
- **세 번째 행**: `문제,정답` (헤더)
- **네 번째 행부터**: 실제 문제와 정답 쌍
- 쉼표(,)로 구분
- UTF-8 인코딩 사용
- 파일명 앞에 학년 표시 (예: `m1_anatomy.csv`, `m2_pathology.csv`)

## 🗂️ 프로젝트 구조

```
src/
├── lib/
│   ├── types.ts          # TypeScript 타입 정의
│   ├── quiz.ts           # 퀴즈 로직 및 CSV 파싱
│   └── assets/           # 정적 자산
├── routes/
│   ├── +layout.svelte    # 전역 레이아웃
│   ├── +page.svelte      # 메인 페이지 (퀴즈 선택)
│   └── quiz/
│       └── +page.svelte  # 퀴즈 실행 페이지
static/
└── quizzes/              # CSV 파일 저장소
    └── sample_quiz.csv   # 샘플 퀴즈
```

## 🎯 사용 방법

### 1. 퀴즈 파일 추가
- `static/quizzes/` 폴더에 CSV 파일을 저장
- 파일명은 퀴즈 제목으로 사용됩니다 (예: `cardiology_quiz.csv` → "cardiology quiz")

### 2. 퀴즈 진행
1. 메인 페이지에서 원하는 퀴즈 카드를 클릭하여 선택
2. 피드백 방식 선택:
   - **즉시 피드백**: 각 문제 답변 후 바로 정답 확인
   - **완료 후 피드백**: 모든 문제 완료 후 종합 결과 확인
3. 기타 설정 (문제 순서 섞기 등) 조정
4. "퀴즈 시작하기" 버튼 클릭
5. 각 문제에 답변 입력 후 Enter 키 또는 버튼으로 진행
6. 완료 후 결과 확인

### 3. 결과 확인
- 점수 및 정답률 표시
- 각 문제별 상세 결과
- 틀린 문제의 정답 확인

## 🚀 배포 (Vercel)

### 1. Vercel 연결
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel
```

### 2. 환경 설정
- Build Command: `npm run build`
- Output Directory: `build`
- Framework Preset: SvelteKit

### 3. 자동 배포
- GitHub 저장소와 연결하면 자동 배포 설정 가능
- 메인 브랜치에 push할 때마다 자동 배포

## 🛠️ 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run check

# 실시간 타입 체크
npm run check:watch

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 포맷팅 검사
npm run format:check
```

## 🔧 확장성 고려사항

### 현재 구현
- 로컬 CSV 파일 읽기
- 클라이언트 사이드 라우팅
- 반응형 디자인

### 향후 확장 가능성
- 사용자 인증 시스템
- 문제 카테고리 분류
- 학습 진도 추적
- 온라인 문제 데이터베이스 연동
- 다중 선택 문제 지원
- 이미지/미디어 문제 지원

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있거나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**Made with ❤️ for medical students**

## 📋 개발 일지

### 프로젝트 초기 설정 (2025.08.02)

1. **SvelteKit 프로젝트 초기화**
   - `npx sv create` 명령어로 최신 SvelteKit 프로젝트 생성
   - TypeScript 지원 활성화
   - 기본 프로젝트 구조 설정

2. **의존성 설치 및 개발 도구 설정**
   - **Papa Parse**: CSV 파일 파싱을 위한 라이브러리
   - **ESLint**: 코드 품질 관리
   - **Prettier**: 코드 포맷팅
   - **TypeScript**: 타입 안전성 확보

3. **핵심 기능 구현**
   - **타입 시스템**: `QuizQuestion`, `Quiz`, `QuizResult` 인터페이스 정의
   - **CSV 파서**: Papa Parse를 활용한 CSV 파일 로딩 로직
   - **퀴즈 로직**: 문제 섞기, 점수 계산, 결과 분석 기능
   - **라우팅**: 메인 페이지와 퀴즈 페이지 분리

4. **UI/UX 디자인**
   - **반응형 디자인**: 모바일과 데스크톱 지원
   - **그라디언트 테마**: 의료진을 위한 전문적인 블루-퍼플 그라디언트
   - **인터랙티브 요소**: 호버 효과, 애니메이션, 진행 표시바
   - **접근성**: 키보드 네비게이션, 명확한 시각적 피드백

5. **배포 준비**
   - **Vercel 설정**: `vercel.json` 파일로 배포 최적화
   - **빌드 최적화**: SvelteKit의 정적 생성 기능 활용
   - **환경 설정**: 개발/프로덕션 환경 분리

### UI/UX 개선 (2025.08.02 - 추가 개선)

6. **퀴즈 선택 방식 개선**
   - 드롭다운에서 카드 버튼 형식으로 변경
   - 선택된 퀴즈 시각적 표시 (그라디언트 배경)
   - 퀴즈 제목 자동 변환 (언더스코어 → 공백, 대문자 변환)

7. **퀴즈 모드 선택 기능 추가**
   - **즉시 피드백 모드**: 각 문제 답변 후 바로 정답 확인
   - **완료 후 피드백 모드**: 모든 문제 완료 후 종합 결과 확인
   - 문제 순서 섞기 옵션 추가
   - 퀴즈 시작 전 설정 선택 인터페이스

8. **디자인 정리**
   - 모든 이모티콘 제거로 깔끔한 전문적 디자인 유지
   - 라디오 버튼과 체크박스 스타일링 개선
   - 피드백 표시 시각적 개선 (배경색, 아이콘 변경)

### CSV 형식 및 학년 분류 시스템 개선 (2025.08.02 - 추가 개선)

9. **CSV 파일 형식 개선**
   - 첫 번째 행에 한국어 퀴즈 제목 추가
   - 두 번째 행에 학년 정보 (M1~M6) 추가
   - 파일명에 학년 접두사 추가 (예: m1_anatomy.csv)
   - 직관적인 퀴즈 제목 표시

10. **학년별 분류 시스템**
    - 학년 필터 드롭다운 추가 (전체, M1~M6)
    - 퀴즈 카드에 학년 배지 표시
    - 학년별 퀴즈 자동 분류 및 필터링

11. **UI 디테일 개선**
    - 정답/오답 표시를 ○/× 형태로 변경하여 더 깔끔하게
    - 아이콘에 배경색 원형 디자인 적용
    - 퀴즈 카드에 학년 정보 시각적 표시

### 주요 기술적 결정사항

- **SvelteKit 선택 이유**: 
  - 빠른 개발 속도와 작은 번들 크기
  - Vercel과의 뛰어난 호환성
  - TypeScript 네이티브 지원

- **CSV 형식 채택**:
  - 의료진이 Excel에서 쉽게 편집 가능
  - 버전 관리 용이성
  - 확장성 (향후 다른 형식 지원 가능)

- **클라이언트 사이드 처리**:
  - 서버 비용 절약
  - 빠른 응답성
  - 오프라인 사용 가능성

### 향후 개발 계획

1. **단기 목표** (1-2주)
   - 다중 선택 문제 지원
   - 이미지 문제 지원
   - 학습 통계 저장 (로컬 스토리지)

2. **중기 목표** (1-2개월)
   - 사용자 계정 시스템
   - 온라인 문제 데이터베이스
   - 실시간 리더보드

3. **장기 목표** (3-6개월)
   - 모바일 앱 (Progressive Web App)
   - AI 기반 문제 추천
   - 협업 학습 기능
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
