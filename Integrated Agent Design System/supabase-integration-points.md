# Supabase Integration Points

## 1. 연결 범위
Supabase는 정적 GitHub Pages 사이트에 동적 상태를 추가하는 용도로 사용한다.

적용 범위:
- 사용자 인증(선택)
- 보고서 조회 이력 저장
- 보고서 확인 상태 저장
- 운영 로그 저장
- 보고서 메타데이터 동기화(선택)

## 2. 프런트엔드 연결 포인트
### assets/js/config.js
```js
window.APP_CONFIG = {
  BASE_PATH: '',
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  TIMEZONE: 'Asia/Seoul'
};
```

### assets/js/supabase-client.js
권장 역할:
- Supabase client 초기화
- auth session 조회
- 공통 query helper 제공

## 3. 메인 페이지 연결 포인트
메인 페이지에서 필요한 흐름:
1. 현재 사용자 식별
2. `report_acknowledgements` 조회
3. `reports.json` 과 조합
4. unread/total 계산
5. 요약 카드와 리스트 렌더링

권장 함수:
- `getCurrentViewer()`
- `fetchAcknowledgements(viewerId)`
- `buildCategorySummary(reports, acknowledgements)`

## 4. 상세 페이지 연결 포인트
상세 페이지에서 필요한 흐름:
1. reportId 읽기
2. Markdown 로드 및 렌더링
3. `report_views` insert
4. 사용자가 확인 완료 시 `report_acknowledgements` upsert

권장 함수:
- `recordReportView(reportId, viewerId)`
- `acknowledgeReport(reportId, viewerId)`

## 5. 테이블별 연결 포인트
### reports
용도:
- 선택적으로 GitHub의 `reports.json` 과 동기화된 메타 저장소

사용처:
- 백엔드/관리자 검증
- 검색, 통계, 관리 기능 확장

### report_views
용도:
- 어떤 사용자가 어떤 보고서를 언제 열었는지 기록

프런트엔드 호출 시점:
- 상세 페이지 진입 직후

### report_acknowledgements
용도:
- 사용자별 확인 완료 상태 저장

프런트엔드 호출 시점:
- 사용자가 상세 화면에서 확인 처리 버튼을 눌렀을 때
- 또는 상세 열람 즉시 확인 처리 정책을 쓸 경우 상세 진입 시점

### system_logs
용도:
- 프런트엔드 예외, API 실패, 동기화 오류 기록

호출 방식:
- 직접 insert 보다는 Edge Function 또는 제한된 API 경유 권장

## 6. 권장 추가 테이블
필요 시 아래 테이블 확장 가능:
```sql
create table if not exists users_profile (
  id uuid primary key,
  viewer_id text not null unique,
  display_name text,
  timezone text default 'Asia/Seoul',
  created_at timestamptz not null default now()
);
```

## 7. RLS 정책 방향
### report_views
- insert: 로그인 사용자 허용
- select: 관리자 또는 본인 데이터만 허용

### report_acknowledgements
- select: 본인 row만 허용
- insert/upsert: 본인 row만 허용

### system_logs
- 일반 사용자 직접 insert 제한 권장
- edge function 전용 쓰기 권장

## 8. 권장 클라이언트 함수 구조
```text
assets/js/
  config.js
  supabase-client.js
  report-service.js
  view-service.js
  log-service.js
```

### report-service.js
- `fetchReportsJson()`
- `fetchMarkdownReport(filePath)`
- `fetchAcknowledgements(viewerId)`

### view-service.js
- `recordReportView(reportId, viewerId, metadata)`
- `acknowledgeReport(reportId, viewerId)`

### log-service.js
- `writeClientLog(level, message, context)`

## 9. GitHub Pages + Supabase 역할 경계
GitHub Pages가 담당:
- 문서 파일 배포
- 정적 사이트 제공

Supabase가 담당:
- 사용자 상태 저장
- 조회 기록 저장
- 인증/권한 제어

즉, 보고서 내용 자체는 GitHub에서 읽고, 사용자 활동 데이터만 Supabase에 기록한다.

## 10. 운영 시나리오 예시
### 시나리오 A: 메인 진입
- `reports.json` fetch
- 로그인 세션 확인
- acknowledgement 조회
- 카테고리별 unread 계산
- 카드 렌더링

### 시나리오 B: 상세 진입
- querystring 에서 `reportId` 획득
- 대상 Markdown 로드
- `report_views` insert
- UI 렌더링

### 시나리오 C: 확인 완료
- 확인 버튼 클릭
- `report_acknowledgements` upsert
- 메인 복귀 시 unread count 감소

## 11. 추천 구현 우선순위
1. GitHub Pages 정적 경로 안정화
2. `config.js` + `BASE_PATH` 도입
3. Supabase client 추가
4. report_views insert 연결
5. report_acknowledgements upsert 연결
6. RLS 정책 강화
