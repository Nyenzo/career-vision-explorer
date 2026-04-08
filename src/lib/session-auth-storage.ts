const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

// Compatibility window: read legacy localStorage values, but keep new writes in session storage only.
const LEGACY_LOCALSTORAGE_COMPAT = false;

function getSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readString(key: string): string | null {
  const session = getSessionStorage();
  const local = getLocalStorage();

  const sessionValue = session?.getItem(key) || null;
  if (sessionValue) return sessionValue;

  const legacyValue = local?.getItem(key) || null;
  if (legacyValue && session) {
    // Migrate legacy value to session storage on first read.
    session.setItem(key, legacyValue);
  }

  return legacyValue;
}

function writeString(key: string, value: string | null): void {
  const session = getSessionStorage();
  const local = getLocalStorage();

  if (value === null) {
    session?.removeItem(key);
    local?.removeItem(key);
    return;
  }

  session?.setItem(key, value);

  if (LEGACY_LOCALSTORAGE_COMPAT) {
    local?.setItem(key, value);
  }
}

export const authStorage = {
  getAccessToken(): string | null {
    return readString(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string | null): void {
    writeString(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    return readString(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string | null): void {
    writeString(REFRESH_TOKEN_KEY, token);
  },
  getUserRaw(): string | null {
    return readString(USER_KEY);
  },
  setUserRaw(userRaw: string | null): void {
    writeString(USER_KEY, userRaw);
  },
  clearAuthSession(): void {
    writeString(ACCESS_TOKEN_KEY, null);
    writeString(REFRESH_TOKEN_KEY, null);
    writeString(USER_KEY, null);
  },
};
