'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/base/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/base/card';
import { Input } from '@/components/base/input';
import { Label } from '@/components/base/label';
import { loginWithPassword } from '@/lib/api';
import axios from 'axios';

/**
 * 登入頁。
 *
 * 為什麼需要它：
 * 後端已有帳密登入端點，但前端沒有入口，導致 HttpOnly Cookie 無從取得，
 * 權限相關的畫面永遠停在「未登入」。這一頁只負責把帳密送到 BFF，
 * 由後端驗證並簽發 Cookie。
 *
 * 為什麼送出後要 router.refresh()：
 * 控制台是伺服器元件，登入後需重新向後端取得資料；
 * 只做前端導向會沿用登入前渲染的結果。
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setSubmitting(true);
  setError(null);

  try {
    await loginWithPassword(email, password);

    // 後端已在登入回應設定 Cookie，重新載入首頁取得新的 server session。
    window.location.replace('/');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;

      setError(
        typeof message === 'string'
          ? message
          : message?.zh ??
              (error.response
                ? `登入失敗（HTTP ${error.response.status}）`
                : '無法連線到服務，請稍後再試。'),
      );
    } else {
      setError('登入失敗，請稍後再試。');
    }
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="size-4" />
            登入
          </CardTitle>
          <CardDescription>
            使用 public-service 的帳號登入。登入後才看得到需要權限的內容
            （例如控制台），也才能上傳檔案。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="user@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="至少 8 個字元"
              />
            </div>

            {error ? (
              <p
                className="text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? '登入中…' : '登入'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Continue with OAuth</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" asChild>
              <a href="/api/auth/google?returnTo=/">
                <GoogleIcon className="size-4" />
                Continue with Google
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/auth/github?returnTo=/">
                <GitHubIcon className="size-4" />
                Continue with GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        帳號由後端 public-service 的 auth 模組管理；若尚未有帳號，
        可先請管理員指派，或使用後端的註冊端點建立。
      </p>
    </div>
  );
}

/** 取出後端雙語錯誤訊息中的中文內容（沒有結構化訊息時回傳 null）。 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1.1 1.5 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1.1a9.4 9.4 0 0 1 5 0c2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5a10.1 10.1 0 0 0 6.8-9.5C22 6.6 17.5 2 12 2Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3.2-4.3 3.2-7.3Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9V16A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.7V7.4H2.9a10 10 0 0 0 0 8.6l3.3-2.4Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 3 14.7 2 12 2A10 10 0 0 0 2.9 7.4l3.3 2.5C7 7.9 9.3 6.1 12 6.1Z" />
    </svg>
  );
}

function extractErrorMessage(
  payload: {
    message?: string | { en?: string; zh?: string };
  } | null,
): string | null {
  const message = payload?.message;

  if (!message) {
    return null;
  }

  if (typeof message === 'string') {
    return message;
  }

  return message.zh ?? message.en ?? null;
}
