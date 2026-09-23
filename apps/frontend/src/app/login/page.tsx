'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

import { AUTH_LOGIN_BFF_PATH } from '@test/shared';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(AUTH_LOGIN_BFF_PATH, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response
          .json()
          .catch(() => null)) as {
          message?: string | { en?: string; zh?: string };
        } | null;

        setError(extractErrorMessage(payload) ??
          `登入失敗（HTTP ${response.status}）`);
        return;
      }

      // 登入成功：回首頁並重新向伺服器取得畫面（Cookie 已由後端簽發）。
      router.replace('/');
      router.refresh();
    } catch {
      setError('無法連線到服務，請稍後再試。');
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
