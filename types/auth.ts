/**
 * types/auth.ts
 *
 * Auth-related types — session, user, role.
 */
import type { RestaurantRole } from "@/config/restaurant.config";

export interface SessionUser {
  id:        string;
  name:      string;
  lastname:  string;
  email:     string;
  roleName:  RestaurantRole;
  avatar?:   string;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

export interface AuthState {
  user:    SessionUser | null;
  loading: boolean;
  error:   string | null;
}
