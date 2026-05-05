# ⏰ OpenClaw Cron Job 설정 가이드

> 매일 아침 7시에 OpenClaw가 자동으로 영어 학습 자료를 생성하도록 설정합니다.

---

## 🎯 목표

매일 아침 7시(KST)에 OpenClaw가 다음을 자동으로 수행:

1. `daily_schedule.csv`에서 오늘 날짜의 학습 정보 확인
2. YouTube 트랜스크립트를 MCP 도구로 가져오기
3. 핵심 문장 20개 선정 + 단어/표현 정리
4. `output/` 폴더에 학습 자료 생성
5. `study_progress.csv`에 진행 상황 기록

---

## 📋 OpenClaw에게 보낼 프롬프트

아래 프롬프트를 OpenClaw의 **Scheduled Task / Cron Job** 기능에 등록하세요.

---

### 🤖 프롬프트

```
당신은 매일 영어 학습 자료를 자동으로 생성하는 AI 튜터입니다.

아래 지시를 순서대로 수행하세요:

1. 먼저 `/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/openclaw_instructions.md` 파일을 읽고 전체 작업 흐름을 파악하세요.

2. `/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/daily_schedule.csv` 파일을 읽고, 오늘 날짜(YYYY-MM-DD)에 해당하는 행을 찾으세요.

3. `/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/study_progress.csv` 파일을 확인하여 오늘 날짜가 이미 completed 상태인지 확인하세요. 이미 완료되었으면 "오늘의 학습은 이미 완료되었습니다."라고 출력하고 종료하세요.

4. 오늘 날짜에 해당하는 행이 있으면:
   a. `youtube-transcript__get_transcript` MCP 도구를 사용하여 해당 video_id의 영어 자막을 가져오세요.
   b. start_seconds ~ end_seconds 범위의 자막만 추출하세요.
   c. `openclaw_instructions.md`의 템플릿에 따라 학습 자료를 생성하세요.
   d. 결과를 `/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/output/` 폴더에 저장하세요. 파일명은 `dayXX_epY_partZ.md` 형식을 따르세요 (예: day01_ep2_part1.md).
   e. `study_progress.csv`에 완료 기록을 추가하세요.

5. 오늘 날짜에 해당하는 행이 없으면 "오늘은 학습 스케줄이 없습니다."라고 출력하고 종료하세요.

중요사항:
- 모든 설명은 한국어로 작성하세요.
- 핵심 문장은 반드시 20개를 선정하세요.
- 단어/표현 설명에는 뉘앙스, 유사표현, 실생활 사용 예시를 포함하세요.
- output 폴더가 없으면 생성하세요.
- 텔레그램으로 항상 보내세요.
```

---

## ⚙️ Cron Schedule 설정

| 항목                | 값                                                             |
| ------------------- | -------------------------------------------------------------- |
| **실행 시간**       | 매일 오전 7:00 생성, 7:15 전송 (KST, UTC+9)                                    |
| **Cron Expression** | `0 7 * * *` (KST 기준) 또는 `0 22 * * *` (UTC 기준, 전날 23시) |
| **작업 디렉토리**   | `/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/`         |
| **실행 기간**       | 2026-05-02 ~ 2026-05-28 (27일간)                               |

---

## 🛠️ OpenClaw에서 Cron Job 등록 방법

### 방법 1: OpenClaw UI에서 직접 설정

1. OpenClaw 앱을 열고 **Settings → Scheduled Tasks** (또는 **Automations**)로 이동
2. **New Task** 클릭
3. 아래 정보 입력:
   - **Task Name**: `Daily English Study - Hey Tablo`
   - **Schedule**: `Every day at 7:00 AM (generation) / 7:15 AM (delivery)`
   - **Prompt**: 위의 프롬프트를 붙여넣기
   - **Working Directory**: `/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/`
4. **MCP Tools**: `youtube-transcript` 서버가 활성화되어 있는지 확인
5. **Save & Enable**

### 방법 2: OpenClaw CLI로 설정

```bash
openclaw schedule create \
  --name "Daily English Study - Hey Tablo" \
  --cron "0 7 * * *" \
  --timezone "Asia/Seoul" \
  --prompt-file "/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/cron_prompt.md" \
  --working-dir "/Users/woongs/Desktop/Develop/monster_calculator/docs/english-automation/"
```

### 방법 3: 수동 실행 (테스트용)

OpenClaw에게 직접 위의 프롬프트를 보내서 제대로 동작하는지 먼저 테스트해보세요.

---

## ✅ 체크리스트

- [ ] OpenClaw에 `youtube-transcript` MCP 서버가 연결되어 있는지 확인
- [ ] `output/` 폴더 생성 (없으면 자동 생성되도록 프롬프트에 포함됨)
- [ ] 첫 번째 학습 (Day 1, 2026-05-02)을 수동으로 테스트 실행
- [ ] Cron Job이 정상 등록되었는지 확인
- [ ] `study_progress.csv`에 기록이 정상적으로 추가되는지 확인
- [ ] 텔래그램 보낼 수 있는지 체크

---

## 📊 진행 상황 모니터링

학습이 잘 진행되고 있는지 확인하려면:

```
study_progress.csv 파일을 열어서 최근 기록을 확인하세요.
- status가 "completed"이면 정상
- status가 "failed"이면 notes 컬럼에서 원인을 확인
```

---

## 🔄 스케줄 수정이 필요한 경우

- `daily_schedule.csv`에서 날짜나 시간대를 수정하면 됩니다.
- 새로운 에피소드를 추가하려면 `english_youtube_links.md`와 `daily_schedule.csv` 모두 업데이트하세요.
- 주말을 쉬고 싶다면 `daily_schedule.csv`에서 해당 날짜 행을 삭제하거나 날짜를 조정하세요.


Python fallback script path:

```bash
/Users/woongs/Desktop/Develop/monster_calculator/scripts/english-study/fetch_transcript.py
```
