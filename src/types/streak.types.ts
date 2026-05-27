export const MILESTONE_DAYS = [7, 14, 30, 60, 100, 200, 365] as const;

export type MilestoneDay = (typeof MILESTONE_DAYS)[number];

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  dailyTaskGoal: number;
  todayCount: number;
  lastStreakDate: string | null;
  milestones: MilestoneEntry[];
}

export interface MilestoneEntry {
  day: MilestoneDay;
  achieved: boolean;
  achievedAt: string | null;
  icon: string;
  label: string;
}

export type StreakTier = "none" | "spark" | "flame" | "fire";

export interface StreakIconInfo {
  emoji: string;
  tier: StreakTier;
  color: string;
  label: string;
}
