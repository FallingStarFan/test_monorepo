"use client";

import type { OAuthProvider } from "@test/shared";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/base/button";
import { getOAuthUrl } from "@/lib/api";

interface OAuthButtonProps {
  provider: OAuthProvider;
  children: ReactNode;
}

export function OAuthButton({ provider, children }: OAuthButtonProps) {
  const pathname = usePathname();

  return (
    <Button variant="outline" asChild>
      <a href={getOAuthUrl(provider, pathname || "/")}>{children}</a>
    </Button>
  );
}
