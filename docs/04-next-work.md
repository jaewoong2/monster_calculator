# 04. Next Work

이 문서는 현재 개발 슬라이스 이후로 넘긴 작업을 정리한다.

## 완료된 기준선

- Expo Router 탭 2개를 제품 탭(`계산기`, `빠른 계산`)으로 교체했다.
- NativeWind v4 기본 설정과 semantic color token을 연결했다.
- 메인 계산기 화면, 키패드, 결과창, Zustand 계산 엔진을 구현했다.
- 빠른 계산 4종(나눠 계산, 할인, 팁, 퍼센트) 카드와 즉시 계산 결과 UI를 구현했다.
- 블루우는 계산기 상태별 정적 에셋 매핑까지만 연결했다.

## 다음 이슈

### Issue 5 후속: 블루우 리액션 UI

- `idle`, `input`, `thinking`, `success`, `error` mood별 보조 UI를 정리한다.
- `error` 상태에는 당황 마크나 땀방울을 결과 숫자를 가리지 않는 위치에 배치한다.
- 헤더 영역에는 캐릭터를 추가하지 않는다.

### Issue 6: Reanimated 애니메이션

- `idle`: `welcome_bluu.png`에 짧은 부유 애니메이션.
- `input`: 입력 시 짧은 bounce 또는 눈 깜빡임.
- `thinking`: `timer_bluu.png` 전환.
- `success`: `wink_bluu.png`에 0.3초 내외 jump.
- `error`: 좌우 shake.

### 빠른 계산 후속 개선

- 입력값 천 단위 구분 표시와 포커스 이동 UX를 다듬는다.
- 계산 결과를 계산기 기록과 연결할지 여부를 결정한다.
- 카드 접힘 상태를 저장할지 검토한다.

## 품질 보강

- `package.json`에 `typecheck: "tsc --noEmit"` 스크립트 추가를 검토한다.
- 계산 엔진 테스트를 추가하려면 store 로직을 순수 reducer로 분리하는 것이 좋다.
- `npm test`는 아직 정의되지 않았으므로 Jest 도입 여부를 별도 결정한다.
