export interface MentorExpertise {
  mentorExpertiseId?: number;
  expertiseName?: string;
}

export interface MentorDiscipline {
  mentorDisciplineId?: number;
  disciplineName?: string;
}

export interface MentorFluency {
  mentorFluencyId?: number;
  fluencyName?: string;
}

export interface Mentor {
  userId?: number;
  authUid?: string;
  fullName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;

  company?: string;
  positionTitle?: string;
  linkedInUrl?: string;
  avgRating?: number;
  totalReviews?: number;
  totalSessions?: number;

  bio?: string;
  profilePicture?: string;

  expertise?: MentorExpertise[];
  disciplines?: MentorDiscipline[];
  fluency?: MentorFluency[];
  experiences?: MentorExperience[];
  scholarshipsAttained?: []
}

export interface MentorExperience {
  title?: string;
  companyImage?: string;
  year: string;
  description?: string;
  startDate?: string;  // ISO string
  endDate?: string | null; // null = Present
}

// --- Request DTOs ---
export interface CreateMentorRequest {
  fullName: string;
  email: string;
  plainPassword: string;
  company?: string;
  positionTitle?: string;
  linkedInUrl?: string;
}

export interface UpdateMentorRequest {
  fullName?: string;
  email?: string;
  company?: string;
  positionTitle?: string;
  linkedInUrl?: string;
  isActive?: boolean;
}

// --- Generic API Response wrapper ---
export interface ApiResponse<Mentor> {
  success: boolean;
  statusCode: number;
  message: string;
  data: Mentor;
}
