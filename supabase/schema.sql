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

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'wedding_gifts') then
    alter publication supabase_realtime add table wedding_gifts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'wedding_config') then
    alter publication supabase_realtime add table wedding_config;
  end if;
end $$;

-- ============================================================
-- 신혼여행 체크리스트 (사용자 편집 가능)
-- ============================================================

create table if not exists honeymoon_checklist (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  category_icon text not null default '',
  category_order int not null default 0,
  name text not null,
  note text not null default '',
  checked boolean not null default false,
  checked_bride boolean not null default false,
  checked_groom boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table honeymoon_checklist add column if not exists checked_bride boolean not null default false;
alter table honeymoon_checklist add column if not exists checked_groom boolean not null default false;

create index if not exists honeymoon_checklist_order_idx
  on honeymoon_checklist(category_order, position);

alter table honeymoon_checklist enable row level security;

drop policy if exists "public all on honeymoon_checklist" on honeymoon_checklist;
create policy "public all on honeymoon_checklist"
  on honeymoon_checklist for all
  using (true) with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'honeymoon_checklist') then
    alter publication supabase_realtime add table honeymoon_checklist;
  end if;
end $$;

-- ============================================================
-- 신혼여행 일일 지출
-- ============================================================

create table if not exists honeymoon_expenses (
  id uuid primary key default gen_random_uuid(),
  spent_at date not null default current_date,
  category text not null default '',
  memo text not null default '',
  amount_usd numeric(10, 2) not null default 0,
  amount_krw int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists honeymoon_expenses_date_idx
  on honeymoon_expenses(spent_at desc, created_at desc);

alter table honeymoon_expenses enable row level security;

drop policy if exists "public all on honeymoon_expenses" on honeymoon_expenses;
create policy "public all on honeymoon_expenses"
  on honeymoon_expenses for all
  using (true) with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'honeymoon_expenses') then
    alter publication supabase_realtime add table honeymoon_expenses;
  end if;
end $$;

-- ============================================================
-- 신혼여행 티켓·서류 (PDF/이미지 첨부)
-- ============================================================

create table if not exists honeymoon_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default '기타',
  file_path text not null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  file_size int not null default 0,
  memo text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table honeymoon_documents enable row level security;

drop policy if exists "public all on honeymoon_documents" on honeymoon_documents;
create policy "public all on honeymoon_documents"
  on honeymoon_documents for all
  using (true) with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'honeymoon_documents') then
    alter publication supabase_realtime add table honeymoon_documents;
  end if;
end $$;

-- ============================================================
-- Storage bucket (PDF/이미지 파일 저장)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('honeymoon-docs', 'honeymoon-docs', true)
on conflict (id) do nothing;

drop policy if exists "public read honeymoon-docs" on storage.objects;
create policy "public read honeymoon-docs"
  on storage.objects for select
  using (bucket_id = 'honeymoon-docs');

drop policy if exists "public insert honeymoon-docs" on storage.objects;
create policy "public insert honeymoon-docs"
  on storage.objects for insert
  with check (bucket_id = 'honeymoon-docs');

drop policy if exists "public update honeymoon-docs" on storage.objects;
create policy "public update honeymoon-docs"
  on storage.objects for update
  using (bucket_id = 'honeymoon-docs');

drop policy if exists "public delete honeymoon-docs" on storage.objects;
create policy "public delete honeymoon-docs"
  on storage.objects for delete
  using (bucket_id = 'honeymoon-docs');
