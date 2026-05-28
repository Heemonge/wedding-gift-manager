# Supabase 셋업 가이드

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 가입 (GitHub 로그인 가능)
2. **New Project** 클릭
3. 입력:
   - Name: `wedding-gift-manager`
   - Database Password: 강력한 비번 (저장 안 해도 됨, 안 씀)
   - Region: **Northeast Asia (Seoul)** 선택
4. **Create new project** 클릭 (2분 대기)

## 2. 테이블 생성

1. 좌측 메뉴 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/schema.sql` 파일 내용 전체 복사 → 붙여넣기
4. **Run** 클릭 (Success 떠야 함)

## 3. URL과 anon key 복사

1. 좌측 메뉴 **Project Settings** (톱니바퀴) → **API**
2. 두 가지 값을 복사해두세요:
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key (긴 토큰)

## 4. GitHub Secrets 등록

1. GitHub 레포 페이지 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭 두 번:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` / Value: (Project URL)
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` / Value: (anon key)

## 5. 로컬 개발용 .env.local 파일 생성

레포 루트에 `.env.local` 파일 만들기 (gitignore 됨):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 6. 배포 확인

`git push` 하면 GitHub Actions가 자동 빌드/배포. 1~2분 후
https://heemonge.github.io/wedding-gift-manager/ 에서 양쪽 기기로 입력해보세요.

## 7. 결혼식 끝나면

Supabase 대시보드에서 프로젝트 삭제 (또는 테이블 drop):
```sql
drop table wedding_gifts;
drop table wedding_config;
```
