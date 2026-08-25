import type { LoginCredentials, UserProfile } from "@/core/domain/entities/UserProfile";
import type { UserRepository } from "@/core/domain/repositories/UserRepository";
import { CURRENT_USER } from "@/data/mocks/user";

export class MockUserRepository implements UserRepository {
  async getProfile(): Promise<UserProfile> {
    return CURRENT_USER;
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    return credentials.email.length > 0 && credentials.password.length > 0;
  }
}
