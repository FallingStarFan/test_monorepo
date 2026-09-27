const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_URL");
}

let apiUrl: string;

try {
  const parsed = new URL(configuredApiUrl);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error();
  }

  apiUrl = parsed.toString().replace(/\/$/, "");
} catch {
  throw new Error("NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL");
}

export const env = {
  apiUrl,
} as const;

export const isDevMode = process.env.NODE_ENV === "development";
export const isProdMode = process.env.NODE_ENV === "production";
