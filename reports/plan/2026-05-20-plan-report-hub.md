---
report_id: rpt_20260520_001
category: plan
title: 개발 작업 리포트 허브 작업 수행 계획서
status: published
created_at: 2026-05-20T09:00:00+09:00
updated_at: 2026-05-20T14:10:00+09:00
author: agent
project_key: report-hub
tags:
  - github-pages
  - supabase
  - report-hub
  - validation
summary: 루트 구조 기준 리포트 허브 구축, 점검 페이지 추가, GitHub Pages 및 Supabase 연동 기준 정리 계획
---

# 개발 작업 리포트 허브 작업 수행 계획서

## 목표
- 개발 작업 보고서 4종을 일관된 Markdown 구조로 관리한다.
- 루트 기준 정적 사이트 구조에서 GitHub Pages 배포가 가능한 리포트 허브를 완성한다.
- Supabase를 이용해 조회 이력과 확인 상태를 기록할 수 있게 한다.
- 사용자가 점검 항목을 직접 체크하면서 다음 단계를 바로 확인할 수 있는 검증 페이지를 제공한다.

## 작업 범위
### 포함 범위
- 보고서 4종 Markdown 파일 관리
- 루트 기준 `index.html`, `pages`, `assets`, `data`, `reports`, `supabase` 구조 정리
- GitHub Pages base path 대응
- Supabase 조회/확인 상태 연결 포인트 정리
- 검증 체크리스트 문서 및 체크 페이지 구축

### 제외 범위
- 실제 GitHub 저장소 커밋 및 배포 실행
- 실제 Supabase 키 입력 및 실환경 인증 연결
- 서버 측 API 서비스의 최종 운영 배포

## 구현 전략
### 1. 구조 정리
- 실행용 파일은 루트에 배치한다.
- `Integrated Agent Design System` 폴더에는 설계 문서만 유지한다.
- 데이터 원본과 UI 렌더링 경로를 분리하되, 상대 경로와 base path 함수로 연결한다.

### 2. 프런트엔드 보강
- 메인 화면은 카테고리별 요약, 미확인 개수, 최신 보고서, 동적 리스트를 제공한다.
- 상세 화면은 보고서 메타데이터, Markdown 렌더링, 조회 이력 기록, 확인 처리 흐름을 제공한다.
- 체크리스트 전용 페이지는 로컬 저장소 기반 체크 상태 관리와 다음 단계 제안을 제공한다.

### 3. 데이터 및 연결 전략
- `data/reports.json`은 화면 렌더링 기준의 메타데이터 원본으로 유지한다.
- Supabase는 조회 이력과 확인 상태만 담당하도록 분리한다.
- 정적 콘텐츠는 GitHub Pages, 동적 상태는 Supabase가 담당한다.

### 4. 오류 대응 전략
- 파일 단위로 작업을 분리해 실패 지점을 명확히 식별한다.
- 동일 단계 자동 재시도는 최대 2회로 제한한다.
- 3회째 동일 단계 오류 시 원인과 개선 방안을 보고하고 다음 결정을 대기한다.

## 단계별 계획
1. 루트 기준 실행 구조 정리
2. 메인 화면 로직 보강
3. 상세 화면 로직 보강
4. HTML 구조와 데이터 메타 정합성 보강
5. 점검 체크리스트 문서 및 전용 페이지 추가
6. 보고서 4종을 실제 변경 내용 기준으로 업데이트

## 산출물
- `index.html`
- `pages/report-detail.html`
- `pages/root-structure-validation-checklist.html`
- `assets/js/main.js`
- `assets/js/detail.js`
- `assets/js/root-structure-validation-checklist.js`
- `data/reports.json`
- `data/root-structure-validation-checklist.json`
- 보고서 4종 Markdown 파일
- 설계 문서 모음

## 완료 기준
- 루트 기준 정적 구조에서 메인/상세/체크리스트 페이지가 모두 열린다.
- `data/reports.json` 기준으로 보고서 목록과 상세 링크가 정상 동작한다.
- Supabase 미설정 상태에서도 화면이 깨지지 않는다.
- 체크리스트 페이지에서 체크 상태 저장, 진행률 계산, 다음 단계 표시가 동작한다.
- 보고서 4종이 현재 작업 내역을 반영한 상태로 저장된다.
