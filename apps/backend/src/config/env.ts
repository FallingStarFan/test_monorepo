process.loadEnvFile();

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}


const backendUrl = requiredEnv('API_ORIGIN');
const frontendUrl = requiredEnv('WEB_ORIGIN');
const env = {
  // App
  appName: requiredEnv('APP_NAME'),
  appVersion: requiredEnv('APP_VERSION'),
  // Backend
  apiOrigin: requiredEnv('API_ORIGIN'),
  webOrigin: requiredEnv('WEB_ORIGIN'),
  serverPort: parseInt(requiredEnv('SERVER_PORT')),

  // Database 
  publicServiceDatabaseUrl: requiredEnv('PUBLIC_SERVICE_DATABASE_URL'), //db 不同database
  
  // Oauth
  googleClientId: requiredEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
  githubClientId: requiredEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: requiredEnv('GITHUB_CLIENT_SECRET'),
  // Oauth callback URL
  googleCallbackUrl: `${backendUrl}/api/auth/google/callback`,
  githubCallbackUrl: `${backendUrl}/api/auth/github/callback`,

  // JWT Configuration
  jwtAccessExpires: requiredEnv('JWT_ACCESS_EXPIRES'),
  jwtAccessSecret: requiredEnv('JWT_ACCESS_SECRET'),
  jwtRefreshExpires: requiredEnv('JWT_REFRESH_EXPIRES'),
  jwtRefreshSecret: requiredEnv('JWT_REFRESH_SECRET'),

  // File Storage
  localStorageDir: requiredEnv('LOCAL_STORAGE_DIR'),

  // R2 Configuration
  r2AccessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
  r2AccountId: requiredEnv('R2_ACCOUNT_ID'),
  r2Bucket: requiredEnv('R2_BUCKET'),
  r2PublicBaseUrl: requiredEnv('R2_PUBLIC_BASE_URL'),
  r2SecretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),

  // Email Configuration
  resendApiKey: requiredEnv('RESEND_API_KEY'),
  resendFromEmail: requiredEnv('RESEND_FROM_EMAIL'),
  signedUrlExpiresSeconds: parseInt(requiredEnv('SIGNED_URL_EXPIRES_SECONDS')),

  // SMTP Configuration
  smtpFrom: requiredEnv('SMTP_FROM'),
  smtpPort: parseInt(requiredEnv('SMTP_PORT')),

  // Super Admin Emails
  superAdminEmails: requiredEnv('SUPER_ADMIN_EMAILS').split(','),
} as const;

export default env;
