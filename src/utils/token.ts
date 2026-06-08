interface TokenClaims {
  sub: string; // userID
  email: string;
  exp: number;
}

// Decodes the JWT payload without verifying the signature.
// Signature verification happens on the backend — here we only read claims.
export function decodeToken(token: string): TokenClaims | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as TokenClaims;
  } catch {
    return null;
  }
}

// Returns the userID stored in the current session token, or null if absent.
export function getSessionUserID(): string | null {
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  return decodeToken(token)?.sub ?? null;
}
