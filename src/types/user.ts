export type UserLevel = "BEGINNER" | "INTERMEDIATE" | "RX" | "RX_PLUS";
export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  profileImage: string | null;
  box: string | null;
  experience: number;
  level: UserLevel;
  role: UserRole;
  isBlocked: boolean;
  createdAt: Date;
}

export interface UserPublic {
  id: string;
  nickname: string;
  profileImage: string | null;
  box: string | null;
  level: UserLevel;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  nickname: string;
  profileImage: string | null;
  role: UserRole;
  level: UserLevel;
}
