export interface Session {
  sessionId: number;
  menteeId: number;
  mentorId: number;
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

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
