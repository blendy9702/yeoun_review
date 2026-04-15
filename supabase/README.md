# Supabase: 리뷰 저장 + 텔레그램 (A안)

> **Edge Function 이름:** `yeoun_review_bot`  
> 코드 위치: `supabase/functions/yeoun_review_bot/` · `verify_jwt` 는 `supabase/config.toml` 에서 비활성화(웹훅 시크릿으로 검증).

프로젝트에 이미 **`TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`** 가 다른 용도로 쓰이고 있다면 **건드리지 마세요.** 이 함수는 전용 시크릿 이름만 읽습니다.

### 인증 없는 리뷰 (의도된 동작)

이 앱은 **로그인·회원가입 없이** 리뷰만 받습니다. DB는 **`anon` 역할에게 INSERT만** 허용하는 RLS 정책이며, `auth.users` 와 연결되지 않습니다. 리뷰 목록을 앱에서 조회하지 않으므로 **SELECT는 anon에 열지 않은** 구성입니다. (대시보드 Table Editor 등으로 확인)

## 1. DB 마이그레이션 적용

[Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor에서 `migrations/20250415120000_create_reviews.sql` 내용을 실행하거나, 로컬에 CLI가 있다면:

```bash
supabase link --project-ref ygnlxpngtzgzbaeeminy
supabase db push
```

## 2. Edge Function 배포

1. [Telegram BotFather](https://t.me/BotFather)로 봇 생성 후 **봇 토큰** 확보  
2. 알림을 받을 **chat_id** 확보 (본인에게 `/start` 후 `getUpdates`로 확인하거나, 그룹이면 봇을 초대한 뒤 메시지 한 번 보내고 동일 API로 확인)  
3. **리뷰 웹훅 전용 비밀값** `YEOUN_REVIEW_WEBHOOK_SECRET` 을 임의의 긴 문자열로 생성 (예: `openssl rand -hex 32`)

터미널에서 (Supabase CLI 로그인·프로젝트 링크 후):

```bash
cd supabase
supabase secrets set --project-ref ygnlxpngtzgzbaeeminy \
  YEOUN_REVIEW_TELEGRAM_BOT_TOKEN="리뷰용_새봇_토큰" \
  YEOUN_REVIEW_TELEGRAM_CHAT_ID="알림받을_chat_id" \
  YEOUN_REVIEW_WEBHOOK_SECRET="웹훅비밀값"

supabase functions deploy yeoun_review_bot --project-ref ygnlxpngtzgzbaeeminy
```

| 시크릿 이름 | 용도 |
|-------------|------|
| `YEOUN_REVIEW_TELEGRAM_BOT_TOKEN` | 리뷰 알림만 보낼 **새 봇** 토큰 |
| `YEOUN_REVIEW_TELEGRAM_CHAT_ID` | 그 알림을 받을 채팅 ID |
| `YEOUN_REVIEW_WEBHOOK_SECRET` | DB Webhook `x-webhook-secret` 과 동일 값 |

배포 후 함수 URL은 다음 형태입니다.

`https://ygnlxpngtzgzbaeeminy.supabase.co/functions/v1/yeoun_review_bot`

## 3. Database Webhook 연결

### 목록이 비어 있을 때

**정상입니다.** 처음 한 번도 웹훅을 만들지 않았으면 목록이 비어 있습니다. **여기서 새 웹훅을 추가해야** insert 이후 텔레그램으로 이어집니다.

1. **Integrations** (또는 **Database** → **Webhooks**) 메뉴로 이동  
2. 직접 열기:  
   `https://supabase.com/dashboard/project/ygnlxpngtzgzbaeeminy/integrations/webhooks`  
3. **Create a new webhook** / **New webhook** / **+** 같은 버튼으로 **새로 추가**  
4. 아래 표대로 저장

| 항목 | 값 |
|------|-----|
| Name | `reviews-insert-telegram` (예시, 아무 이름) |
| Table | `reviews` (스키마 `public`) |
| Events | **Insert** 만 체크 |
| Type | **HTTP Request** 또는 **Supabase Edge Functions** 중 선택 가능한 것 |

**HTTP Request** 로 두는 경우 (가장 흔함):

- **URL**: `https://ygnlxpngtzgzbaeeminy.supabase.co/functions/v1/yeoun_review_bot`  
- **HTTP Method**: `POST`  
- **HTTP Headers**에 다음 추가  
  - `Content-Type`: `application/json`  
  - `x-webhook-secret`: Secrets에 넣은 **`YEOUN_REVIEW_WEBHOOK_SECRET` 과 완전히 동일한 문자열**

**Supabase Edge Functions** 를 고를 수 있으면 함수 `yeoun_review_bot` 을 지정하고, **HTTP Headers**에 `x-webhook-secret` 을 위와 같이 넣을 수 있는지(또는 Advanced) 확인합니다.

> Edge Function은 `x-webhook-secret` 이 `YEOUN_REVIEW_WEBHOOK_SECRET` 과 일치할 때만 처리합니다.

## 4. Next.js 환경 변수

프로젝트 루트에 `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ygnlxpngtzgzbaeeminy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_public_키
```

Dashboard → **Project Settings** → **API** 에서 URL과 `anon` **public** 키를 복사합니다. (`service_role` 은 클라이언트에 넣지 마세요.)

## 5. 동작 확인

1. `npm run dev` 후 `/review` 에서 리뷰 제출  
2. Table Editor에서 `reviews` 행이 생기는지 확인  
3. 텔레그램에 알림 메시지 수신 여부 확인  

문제 시: Dashboard → **Edge Functions** → **Logs** 에서 함수 로그 확인.

### 데이터는 들어가는데 텔레그램만 안 올 때

**행 저장**은 브라우저에서 `anon` 키로 `insert`만 하면 되고, **알림**은 **Database Webhook → Edge Function → Telegram** 이 한 번 더 돌아야 합니다. 웹훅이 없거나 실패하면 **DB에는 쌓이고 텔레그램은 안 옵니다.**

| 순서 | 확인 |
|------|------|
| 1 | **Database → Webhooks** 에 `reviews` 테이블 **Insert** 용 훅이 **실제로 있는지** (없으면 아래 [§3](#3-database-webhook-연결)대로 생성) |
| 2 | 훅 URL = `https://ygnlxpngtzgzbaeeminy.supabase.co/functions/v1/yeoun_review_bot` |
| 3 | 훅 **HTTP Headers**에 `x-webhook-secret` = Secrets의 **`YEOUN_REVIEW_WEBHOOK_SECRET` 과 완전 동일** (앞뒤 공백·따옴표 없이) |
| 4 | **Edge Functions → Secrets**에 `YEOUN_REVIEW_TELEGRAM_BOT_TOKEN`, `YEOUN_REVIEW_TELEGRAM_CHAT_ID`, `YEOUN_REVIEW_WEBHOOK_SECRET` **이름 그대로** 있는지 |
| 5 | 시크릿을 바꾼 뒤에는 **`yeoun_review_bot` 함수를 다시 배포**했는지 |
| 6 | [§6](#6-웹훅-연결-확인) **curl POST**로는 텔레그램이 오는지 → **오면** 웹훅만 손보면 됨 / **안 오면** 봇 토큰·`chat_id`(봇에게 `/start` 했는지) 확인 |

Supabase **SQL Editor**에서 웹훅 HTTP 결과를 볼 수 있으면(프로젝트에 따라 `net` 스키마):

```sql
select id, status_code, content::text, error_msg, created
from net._http_response
order by created desc
limit 20;
```

`status_code` 가 401이면 시크릿 불일치, 500이면 함수 내부 오류입니다.

## 6. 웹훅 연결 확인

브라우저로 함수 URL을 열면 **GET** 요청만 가므로, 예전에는 `405 Method Not Allowed` 가 나올 수 있습니다. 배포본은 **GET 시 JSON 안내**를 반환합니다. 실제 알림 검증은 아래 **POST(curl)** 로 하세요.

### 대시보드에서

1. **Database → Webhooks**  
   - 리뷰용 훅이 **Enabled** 인지 확인  
   - **Table** = `reviews`, **Events** = **Insert** 만  
   - **URL** = `https://ygnlxpngtzgzbaeeminy.supabase.co/functions/v1/yeoun_review_bot`  
   - **HTTP Headers**에 `x-webhook-secret` 이 있고, 값이 Secrets의 **`YEOUN_REVIEW_WEBHOOK_SECRET` 과 문자 하나까지 동일**한지 확인 (공백·따옴표 주의)

2. **Edge Functions → `yeoun_review_bot` → Logs**  
   - 리뷰 제출 직후 또는 아래 수동 테스트 직후 로그가 찍히는지 확인  
   - `401` → 시크릿/헤더 불일치 · `500` → `YEOUN_REVIEW_TELEGRAM_*` 미설정 또는 텔레그램 API 오류

### 수동으로 함수만 테스트 (DB 웹훅 없이)

Supabase가 보내는 것과 비슷한 JSON 본문으로 Edge Function에 POST 해서, **시크릿 + 텔레그램**까지 한 번에 검증합니다.  
`YOUR_WEBHOOK_SECRET` 을 실제 `YEOUN_REVIEW_WEBHOOK_SECRET` 값으로 바꿉니다.

**Git Bash / macOS / Linux (`curl`):**

```bash
curl -sS -w "\nHTTP:%{http_code}\n" -X POST \
  'https://ygnlxpngtzgzbaeeminy.supabase.co/functions/v1/yeoun_review_bot' \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: YOUR_WEBHOOK_SECRET' \
  -d '{"type":"INSERT","table":"reviews","schema":"public","record":{"id":"00000000-0000-0000-0000-000000000001","name":"웹훅수동테스트","age":28,"mbti":"INTJ","concentration":"EDP","review":"수동 테스트용 리뷰 본문입니다 충분히 깁니다"}}'
```

- 응답 본문에 `"ok":true` 이고 **텔레그램에 메시지**가 오면: 시크릿·토큰·chat_id·함수까지 정상입니다.  
- `"error":"Unauthorized"` → `x-webhook-secret` 과 `YEOUN_REVIEW_WEBHOOK_SECRET` 불일치.  
- `"error":"Server misconfigured"` → `YEOUN_REVIEW_TELEGRAM_BOT_TOKEN` / `YEOUN_REVIEW_TELEGRAM_CHAT_ID` 미설정.

**Windows PowerShell:**

```powershell
$secret = "YOUR_WEBHOOK_SECRET"
$uri = "https://ygnlxpngtzgzbaeeminy.supabase.co/functions/v1/yeoun_review_bot"
$body = @{
  type = "INSERT"
  table = "reviews"
  schema = "public"
  record = @{
    id = "00000000-0000-0000-0000-000000000001"
    name = "웹훅수동테스트"
    age = 28
    mbti = "INTJ"
    concentration = "EDP"
    review = "수동 테스트용 리뷰 본문입니다 충분히 깁니다"
  }
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri $uri -Method POST -Headers @{
  "x-webhook-secret" = $secret
  "Content-Type" = "application/json"
} -Body $body
```

### DB 웹훅만 의심되는 경우

수동 `curl`/`Invoke-RestMethod` 는 성공하는데 **실제 리뷰 제출 시** 텔레그램이 안 오면:

- **Database → Webhooks** 에서 해당 훅의 **Delivery / Recent deliveries** (또는 유사한 로그)에 실패 요청이 있는지 확인  
- 훅의 **URL·헤더**가 위와 일치하는지 다시 저장  

---

### 예전 함수 이름·시크릿 이름을 쓰던 경우

- 함수 URL만 예전 것이었다면: **Database → Webhooks** URL을 `…/yeoun_review_bot` 으로 변경.
- 시크릿을 `TELEGRAM_BOT_TOKEN` 등에서 **`YEOUN_REVIEW_*` 로 바꿨다면**: Dashboard에 위 전용 시크릿을 추가하고 함수를 **재배포**한 뒤, 웹훅 헤더 `x-webhook-secret` 값을 **`YEOUN_REVIEW_WEBHOOK_SECRET` 과 동일**하게 맞춥니다.
