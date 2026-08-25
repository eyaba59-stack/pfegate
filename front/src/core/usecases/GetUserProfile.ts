import type { UserProfile } from "@/core/domain/entities/UserProfile";
import type { UserRepository } from "@/core/domain/repositories/UserRepository";

/**
 * Use case: read the current user's profile settings.
 */
export class GetUserProfile {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserProfile> {
    return this.userRepository.getProfile();
  }
}
