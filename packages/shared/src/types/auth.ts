export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

/**
 * Public JSON representation of an authenticated user.
 * Date values are ISO 8601 strings; credential fields are intentionally absent.
 */
export interface AuthUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRoleData {
  appName: string;
  roleName: string[];
};

export interface AccessTokenMetadata {
  expiresAt: string;
}

export interface AuthSessionData {
  user: AuthUser;
  roles: AuthRoleData[]; 
  accessToken: AccessTokenMetadata;
}

export interface PasswordLoginRequest {
  email: string;
  password: string;
}



export interface RefreshSessionData {
  accessToken: AccessTokenMetadata;
}

/** Public App JSON returned by the Apps API. */
export interface App {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
