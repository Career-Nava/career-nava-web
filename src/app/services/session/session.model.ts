export interface Session {
  sessionId: number;
  menteeId: number;
  menteeName?: string | null;
  menteeEmail?: string | null;
  mentorId: number;
  mentorName?: string | null;
  mentorEmail?: string | null;
  durationMinutes: number;
  status: string;
  calendlyEventUuid?: string | null;
  meetingLink?: string | null;
  calendlyStartAt?: string | null;
  calendlyEndAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Additional session info
  title: string;
  description?: string | null;
  color?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
}
