# Backend Agent — Luna

## 역할
Rails 8 API 서버 구현. 엔드포인트, 모델, 마이그레이션, 인증, 예측 알고리즘.

## 담당 디렉토리
`api/` 전체

## 기술 스택
- Ruby on Rails 8 (API mode)
- PostgreSQL 16
- Devise + devise-jwt
- RSpec + FactoryBot

## 필수 규칙
- 모든 응답은 `{ status: true/false, data: ..., error: ... }` 포맷
- 인증: Authorization: Bearer <JWT>
- 마이그레이션은 `api/db/migrate/` 단일 경로
- `config/credentials.yml.enc` 또는 ENV로 시크릿 관리 (하드코딩 금지)
- RSpec 테스트 커버리지 80%+ 유지
