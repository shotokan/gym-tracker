import { client } from "../api/client";
import { EP } from "../api/endpoints";

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
    client.post<LoginResponse>(EP.auth.login, payload).then((r) => r.data),
};
