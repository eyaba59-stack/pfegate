import type { LoginCredentials, UserProfile } from "@/core/domain/entities/UserProfile";
import type { UserRepository } from "@/core/domain/repositories/UserRepository";
import { ApiError, safe, serverFetch } from "@/config/serverApi";
import { CURRENT_USER } from "@/data/mocks/user";

export class ApiUserRepository implements UserRepository {
  async getProfile(): Promise<UserProfile> {
    const res = await safe<{ fullName: string; email: string; role: string; department: string }>(
      "/api/users/profile",
      CURRENT_USER
    );
    return res as UserProfile;
  }

  /** Backend authentication uses username/password (admin / admin). */
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      await serverFetch<{ token: string; user: UserProfile }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: credentials.email, password: credentials.password }),
      });
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return false;
      throw err;
    }
  }
}
