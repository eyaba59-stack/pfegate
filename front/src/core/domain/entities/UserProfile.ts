/**
 * Core domain entity representing the authenticated user profile.
 */

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  department: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
