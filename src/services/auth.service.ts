import { client } from "../api/client";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expires_in: number;
}

export const authService = {
  login: (payload: LoginPayload) =>
    client.post<LoginResponse>("/auth/login", payload).then((r) => r.data),
};
