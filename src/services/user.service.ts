import { client } from "../api/client";
import { EP } from "../api/endpoints";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  active: boolean;
  created_at: string; // YYYY-MM-DD
}

export const userService = {
  getProfile: (id: string) =>
    client.get<UserProfile>(EP.users.byId(id)).then((r) => r.data),
};
