# 퀴즈 관리 가이드

## 🚀 동적 메타데이터 시스템

이 시스템은 `quizzes.csv` 파일을 기반으로 동적으로 퀴즈 목록을 관리합니다.

## 📁 파일 구조
```
static/
├── quizzes.csv                    # 퀴즈 메타데이터 (중요!)
└── quizzes/
    ├── m1_anatomy_quiz/           # 퀴즈 폴더
    │   ├── m1_anatomy_quiz.csv    # 퀴즈 데이터 (폴더명과 동일)
    │   ├── brain_cortex.jpg       # 이미지 파일들
    │   └── liver.jpg
    ├── m1_sample_quiz/
    │   └── m1_sample_quiz.csv
    └── m2_neurology_quiz/
        └── m2_neurology_quiz.csv
```

## 📝 새 퀴즈 추가 방법

### 1단계: 퀴즈 폴더 생성
```bash
mkdir static/quizzes/m3_cardiology_quiz
```

### 2단계: 퀴즈 CSV 파일 생성
파일명: `m3_cardiology_quiz.csv` (폴더명과 동일!)
```csv
M3 순환기학,M3
문제,정답,이미지파일명
심장의 박동을 조절하는 것은?,동방결절,heart_conduction.jpg
```

### 3단계: quizzes.csv 메타데이터 업데이트
```csv
folder_name,title,grade,last_modified
m1_sample_quiz,순환기 기초,M1,2025-08-03
m1_anatomy_quiz,해부학 기초,M1,2025-08-03
m2_neurology_quiz,신경계학,M2,2025-08-03
m2_pathology_quiz,병리학 기초,M2,2025-08-03
m3_cardiology_quiz,순환기학,M3,2025-08-03  ← 새로 추가
```

### 4단계: 이미지 파일 추가 (선택사항)
```bash
cp heart_image.jpg static/quizzes/m3_cardiology_quiz/
```

## ⚡ 성능 최적화 특징

1. **캐싱 시스템**: 5분간 메타데이터 캐시
2. **Last-Modified 헤더**: 파일 변경 감지로 불필요한 로드 방지
3. **폴백 시스템**: quizzes.csv 로드 실패 시 기본 메타데이터 사용
4. **백그라운드 검증**: 실제 파일 존재 여부 비동기 확인

## 🔧 시스템 관리

### 캐시 무효화
```javascript
// 브라우저 개발자 도구에서 실행
localStorage.clear();
location.reload();
```

### 퀴즈 검증
시스템이 자동으로 다음을 확인합니다:
- quizzes.csv 파일 존재
- 각 퀴즈 폴더의 CSV 파일 존재
- 파일 변경 사항 감지

### 오류 처리
- quizzes.csv 로드 실패 → 폴백 메타데이터 사용
- 개별 퀴즈 파일 누락 → 콘솔 경고, 해당 퀴즈만 제외

## 💡 장점

1. **유지보수성**: 코드 수정 없이 quizzes.csv만 수정
2. **성능**: 캐싱과 Last-Modified 헤더로 최적화
3. **확장성**: 새 퀴즈 추가가 매우 간단
4. **안정성**: 폴백 시스템으로 오류 상황 대응
