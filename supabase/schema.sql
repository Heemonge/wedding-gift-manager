-- ============================================================
-- Wedding Gift Manager - Supabase Schema
-- 사용법: Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run
-- ============================================================

-- 축의금 항목 테이블
create table if not exists wedding_gifts (
  id uuid primary key default gen_random_uuid(),
  side text not null check (side in ('groom', 'bride')),
  name text not null default '',
  relation text not null default '',
  people int not null default 1,
  tickets int not null default 1,
  amount int not null default 0,
  note text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wedding_gifts_side_position_idx
  on wedding_gifts(side, position);

-- 식권 단가/장수/보증인원 설정 (단일 행)
create table if not exists wedding_config (
  id int primary key default 1,
  ticket_price int not null default 65000,
  groom_tickets int not null default 200,
  bride_tickets int not null default 200,
  guaranteed_guests int not null default 220,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- 초기 설정 row 삽입
insert into wedding_config (id) values (1)
  on conflict (id) do nothing;

-- ============================================================
-- RLS (Row Level Security)
-- 정적 사이트 + anon key 노출 환경. 앱 자체에 비번 8789 게이트가 있고
-- 1회성 데이터이므로 공개 read/write 허용. 결혼 끝나면 테이블 삭제하면 됨.
-- ============================================================

alter table wedding_gifts enable row level security;
alter table wedding_config enable row level security;

drop policy if exists "public all on wedding_gifts" on wedding_gifts;
create policy "public all on wedding_gifts"
  on wedding_gifts for all
  using (true) with check (true);

drop policy if exists "public all on wedding_config" on wedding_config;
create policy "public all on wedding_config"
  on wedding_config for all
  using (true) with check (true);

-- ============================================================
-- Realtime 활성화 (양쪽 기기 즉시 동기화)
-- ============================================================

alter publication supabase_realtime add table wedding_gifts;
alter publication supabase_realtime add table wedding_config;
