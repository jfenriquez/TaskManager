export type Role = "USER" | "ADMIN" | "MODERATOR";

export interface UserWithRole {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: boolean;
}
