# OAuth Proxy — הפעלה חד-פעמית

הפרוקסי הזה נדרש כדי שפאנל הניהול (`/admin`) יוכל להתחבר ל-GitHub מטעם הלקוחה, בלי לחשוף את ה-Client Secret בדפדפן. חד-פעמי, בחינם (Cloudflare Free tier).

## שלב 1: יצירת GitHub OAuth App
1. גשי ל-https://github.com/settings/developers → **New OAuth App**.
2. Application name: כל שם (למשל `PhotographerLanding CMS`).
3. Homepage URL: כתובת האתר (למשל `https://photographerlanding.codebloom.co.il`).
4. Authorization callback URL: `https://<worker-subdomain>.workers.dev/callback` — את הכתובת המדויקת מקבלים רק אחרי הדיפלוי בשלב 2, אז אפשר למלא כרגע כתובת זמנית ולעדכן אחר כך ב-**Update application**.
5. שמרי את ה-**Client ID** וה-**Client Secret** שנוצרים.

## שלב 2: דיפלוי ה-Worker
דורש חשבון Cloudflare חינמי (https://dash.cloudflare.com/sign-up).

```bash
npm install -g wrangler
wrangler login
cd oauth-proxy
wrangler deploy
```

בסיום, Wrangler ידפיס את כתובת ה-Worker (למשל `https://photographerlanding-cms-auth.<account>.workers.dev`). עדכני איתה את שלב 1.4 למעלה (Authorization callback URL = `<אותה כתובת>/callback`).

עכשיו קבעי את הסודות (לא נכנסים לקוד/git):
```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## שלב 3: חיבור לפאנל הניהול
ב-`admin/config.yml`, עדכני את `backend.base_url` לכתובת ה-Worker (בלי `/callback` בסוף):
```yaml
base_url: https://photographerlanding-cms-auth.<account>.workers.dev
```

## שלב 4: הוספת הלקוחה כ-collaborator
ב-GitHub: **Settings → Collaborators** של הריפו → **Add people** → הזמיני את חשבון ה-GitHub שנוצר לה, עם הרשאת **Write**.

## בדיקה
גשי ל-`https://<הדומיין שלך>/admin/`, לחצי **Login with GitHub**, ואשרי. אחרי ההתחברות אמור להיפתח פאנל עריכה עם השדות בעברית (גלריה / אודות / תגובות) — בלי שום מסך גיט.
