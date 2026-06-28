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
  calendlyConnected: boolean;

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

export interface AdminMentor {
  mentorId?: number;
  mentorProfileId?: number;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  calendlyConnected?: boolean;
  mentorProfileStatus?: string;
  verified?: boolean;
  profilePicture?: string;
  location?: string;
  company?: string;
  title?: string;
  positionTitle?: string;
  linkedIn?: string;
  linkedInUrl?: string;
  bio?: string;
  yearsExperience?: number | null;
  rating?: number;
  avgAttendance?: number;
  totalReviews?: number;
  totalSessions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EligibleMentorUser {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  calendlyConnected: boolean;
  profilePicture?: string | null;
  company?: string | null;
  positionTitle?: string | null;
  createdAt?: string;
}

export interface MentorOnboardingRequest {
  userId: number;
  status?: string;
  verified?: boolean;
  company?: string | null;
  positionTitle?: string | null;
  linkedInUrl?: string | null;
  bio?: string | null;
}

export interface AdminMentorUpdate {
  fullName?: string | null;
  email?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  positionTitle?: string | null;
  linkedInUrl?: string | null;
  yearsExperience?: number | null;
  verified?: boolean | null;
}

export interface MentorExperience {
  title?: string;
  companyImage?: string;
  year: string;
  description?: string;
  startDate?: string;  // ISO string
  endDate?: string | null; // null = Present
}
