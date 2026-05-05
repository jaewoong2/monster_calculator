# 03. Milestones & Issues: 개발 마일스톤

이 문서는 몬스터즈 계산기의 MVP 구현을 위한 개발 이슈(티켓)와 마일스톤을 정의합니다. 기능 개발 시 아래의 순서에 맞춰 수직적(Vertical)으로 작업을 진행합니다.

## Milestone 1: 뼈대 공사 및 네비게이션
기본적인 앱 프레임워크와 테마를 구성하는 단계입니다.
- **[Issue 1] 기초 세팅 및 하단 탭 라우팅:** ✅ 완료 — Expo Router 하단 탭 2개(계산기, 빠른 계산) 구조로 starter 화면 교체
- **[Issue 2] 테마 및 디자인 시스템 적용:** ✅ 완료 — NativeWind v4 설정(`global.css`, `metro.config.js`, `tailwind.config.js`)과 기본 semantic token 적용

## Milestone 2: 메인 계산기 (코어 로직 & UI)
디자인보다 상태 관리와 계산기의 순수 로직을 먼저 완벽하게 구축하는 단계입니다.
- **[Issue 3] 계산기 코어 엔진 (Zustand):** ✅ 완료 — 사칙연산, 소수점, AC, 삭제, 0 나누기 오류 처리 구현
- **[Issue 4] 계산기 메인 UI:** ✅ 완료 — 결과창, 키패드, 정적 블루우 이미지 배치 및 Zustand 연동

## Milestone 3: 캐릭터 '블루우' 생명 불어넣기 (에셋 매핑 B안)
단순한 계산기에 감성을 추가하는 핵심 단계입니다.
- **[Issue 5] 블루우 상태 관리 및 UI:** 🟡 부분 완료 — 계산기 액션별 mood와 에셋 매핑은 구현, 오버레이 리액션은 다음 작업
- **[Issue 6] 비동기 애니메이션 적용:** ⏳ 대기 — Reanimated Bounce, Jump, Shake, 눈 깜빡임 연동

## Milestone 4: 빠른 계산 탭
반복적인 생활 계산을 재사용 가능한 카드로 제공하는 단계입니다.
- **[Issue 7] 빠른 계산 공통 카드 컴포넌트:** ✅ 완료 — 확장형 카드 UI, 입력 필드, 결과 영역, 블루우 이미지 슬롯 구현
- **[Issue 8] 나눠/할인/팁/퍼센트 계산 로직 및 뷰 연동:** ✅ 완료 — 4가지 계산 타입을 Zod 검증과 함께 카드에 연결
  - *할인 에셋:* `assets/images/tags_bluu.png`
  - *팁 에셋:* `assets/images/thumbs_bluu.png`
  - *퍼센트 에셋:* `assets/images/glass_bluu.png`
