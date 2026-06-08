import { client } from "../api/client";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  active: boolean;
  created_at: string; // YYYY-MM-DD
}

export const userService = {
  getProfile: (id: string) =>
    client.get<UserProfile>(`/users/${id}`).then((r) => r.data),
};
