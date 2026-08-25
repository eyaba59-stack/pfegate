import type { LoginCredentials, UserProfile } from "@/core/domain/entities/UserProfile";

export interface UserRepository {
  getProfile(): Promise<UserProfile>;
  login(credentials: LoginCredentials): Promise<boolean>;
}
