-- 리뷰 저장 (클라이언트는 anon INSERT만)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  age smallint not null check (age >= 1 and age <= 99),
  mbti text not null,
  concentration text not null,
  review text not null
);

comment on table public.reviews is '향수 리뷰 (텔레그램 알림은 DB Webhook → Edge Function)';

alter table public.reviews enable row level security;

grant insert on table public.reviews to anon;

-- 익명 사용자: 행 추가만 허용 (조회는 비허용 — 대시보드/서비스 롤로 확인)
create policy "anon can insert reviews"
  on public.reviews
  for insert
  to anon
  with check (true);
