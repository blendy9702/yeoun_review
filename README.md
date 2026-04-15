# Yeoun Review

여운(Yeoun) 향수 리뷰 랜딩·작성용 [Next.js](https://nextjs.org) 앱입니다.

## 기능

- 메인 페이지 (`/`) — 브랜드 소개, Plasma 배경(데스크톱 최적화)
- 리뷰 작성 (`/review`) — **로그인 없음.** 방문자가 폼만 작성해 제출하면 **Supabase** `reviews` 테이블에 저장 (anon 공개 키 + RLS로 INSERT만 허용)
- **Database Webhook** → Edge Function **`yeoun_review_bot`** → **Telegram** 알림 (운영자용)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 환경 변수

프로젝트 루트에 `.env.local` 을 두고, Supabase **Dashboard → Project Settings → API** 에서 값을 복사합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://ygnlxpngtzgzbaeeminy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public 키>
```

`service_role` 키는 **클라이언트에 넣지 마세요.**

`.env.example` 파일을 참고할 수 있습니다.

## Supabase · 텔레그램 (A안)

DB 마이그레이션, Edge Function 배포, 웹훅·시크릿 설정은 **`supabase/README.md`** 를 따릅니다.

| 항목 | 내용 |
|------|------|
| Edge Function 이름 | **`yeoun_review_bot`** (배포 URL: `…/functions/v1/yeoun_review_bot`) |
| 시크릿 (리뷰 전용) | `YEOUN_REVIEW_TELEGRAM_BOT_TOKEN`, `YEOUN_REVIEW_TELEGRAM_CHAT_ID`, `YEOUN_REVIEW_WEBHOOK_SECRET` — 기존 `TELEGRAM_BOT_TOKEN` 등과 **다른 이름**이라 다른 봇/기능과 충돌하지 않음 |
| 웹훅 | `reviews` 테이블 **Insert** 시 위 함수로 POST, 헤더 `x-webhook-secret` = `YEOUN_REVIEW_WEBHOOK_SECRET` |

이전에 `send-telegram-review` 등 다른 이름으로 배포했다면, 웹훅 URL을 **`yeoun_review_bot`** 으로 바꿉니다.

## 빌드

```bash
npm run build
npm start
```

## 배포 (Vercel)

[Vercel](https://vercel.com)에 올릴 때도 동일한 `NEXT_PUBLIC_*` 환경 변수를 프로젝트 설정에 등록하면 됩니다.
