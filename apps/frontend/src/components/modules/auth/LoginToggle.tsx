"use client";

import { OAUTH_PROVIDERS } from "@test/shared";
import { ChevronDown, LogIn } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/base/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/dropdown-menu";
import { Input } from "@/components/base/input";
import { Label } from "@/components/base/label";
import { OAuthButton } from "@/components/modules/auth/oauth-button/OAuthButton";
import { ApiError, loginWithPassword } from "@/lib/api";

type LoginButtonProps = {
  /** 登入成功後要做的事。不傳的話預設整頁導回首頁（原本行為）。 */
  onSuccess?: () => void;
};

export default function LoginButton({ onSuccess }: LoginButtonProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await loginWithPassword(email, password);

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.replace("/");
      }
    } catch (unknownError) {
      setError(
        unknownError instanceof ApiError
          ? unknownError.message
          : "登入失敗，請稍後再試。",
      );
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
            使用 public-service 的帳號登入。JWT 僅存放在 HttpOnly Cookie， 前端
            JavaScript 不會讀取或保存 Token。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 8 個字元"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? "登入中…" : "登入"}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Continue with OAuth
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">選擇 OAuth 提供者</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
              <DropdownMenuItem asChild>
                <OAuthButton
                  provider={OAUTH_PROVIDERS.GOOGLE}
                >
                  <GoogleIcon className="size-4" />
                  Continue with Google
                </OAuthButton>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <OAuthButton
                  provider={OAUTH_PROVIDERS.GITHUB}
                >
                  <GitHubIcon className="size-4" />
                  Continue with GitHub
                </OAuthButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        尚未有帳號時，可由管理員建立，或使用後端註冊 API。
      </p>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1.1 1.5 1.1.9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1.1a9.4 9.4 0 0 1 5 0c2-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5a10.1 10.1 0 0 0 6.8-9.5C22 6.6 17.5 2 12 2Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3.2-4.3 3.2-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.5l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9V16A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.2 13.6a6 6 0 0 1 0-3.7V7.4H2.9a10 10 0 0 0 0 8.6l3.3-2.4Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 3 14.7 2 12 2A10 10 0 0 0 2.9 7.4l3.3 2.5C7 7.9 9.3 6.1 12 6.1Z"
      />
    </svg>
  );
}