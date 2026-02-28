# 크로스핏 커뮤니티 사이트 — 원칙

## 응답 원칙
- 모든 대답은 한글로 할 것

## 코드 원칙
- 코드는 복잡하지 않게, 가독성 우선으로 작성
- 한 파일에 너무 많은 로직을 담지 않고 적절히 분리
- 과도한 추상화 금지 — 필요할 때만 공통화
- 주석은 "왜(why)"에 대해서만 작성, "무엇(what)"은 코드 자체로 표현
- 네이밍은 직관적으로 (함수명, 변수명만 봐도 역할을 알 수 있게)
- any 사용 금지, 모든 데이터에 타입 또는 인터페이스 정의
- 에러 핸들링: try-catch를 일관성 있게 사용하고, 에러 메시지는 사용자 친화적으로
- API 응답 형식 통일: `{ success: boolean, data?: any, error?: { code: string, message: string } }`
- 컴포넌트는 서버 컴포넌트 기본, 클라이언트 컴포넌트는 필요한 경우에만 `"use client"` 사용
- 폴더는 기능(feature) 단위로 그룹핑
- 반복되는 로직은 커스텀 훅으로 분리 (예: useWodResult, usePagination)
- 커밋 컨벤션: Conventional Commits 형식 사용 (feat:, fix:, refactor: 등)

## 보안 원칙
- 모든 시크릿은 `.env` 파일로 분리, `.gitignore`에 반드시 포함
- 비밀번호: bcrypt 해싱 (salt round 12)
- API 요청: CSRF 토큰 검증
- 입력값: 서버사이드 유효성 검증 (zod 사용)
- XSS: 사용자 입력 sanitize 처리 (DOMPurify)
- 파일 업로드: 확장자 / MIME 타입 / 파일 크기 검증

## UI 원칙
- UI는 우선 기본 Tailwind CSS로 깔끔하게 구현하고, 이후 디자인 수정 예정
- shadcn/ui 컴포넌트 활용 가능
- 반응형 (PC + 모바일) 대응 필수
- 시맨틱 HTML 태그 사용
- 키보드 네비게이션 지원
- 이미지 alt 텍스트 필수
