export interface MentorExpertise {
  mentorExpertiseId?: number;
  expertiseId?: number;
  expertiseName?: string;
}

export interface MentorDiscipline {
  mentorDisciplineId?: number;
  disciplineId?: number;
  disciplineName?: string;
}

export interface MentorFluency {
  mentorFluencyId?: number;
  fluencyId?: number;
  fluencyName?: string;
}

export interface MentorLookupOption {
  id: number;
  name: string;
}

export interface MentorSchedulingDetails {
  mentorEventTypeId?: number | null;
  eventTypeName?: string | null;
  eventTypeDescription?: string | null;
  schedulingUrl?: string | null;
  durationMinutes?: number | null;
  activeStatus?: string | null;
  lastSyncedAt?: string | null;
}

export interface Mentor {
  userId?: number;
  mentorProfileId?: number;
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
  avgRating?: number;
  avgAttendance?: number;
  totalReviews?: number;
  totalSessions?: number;
  createdAt?: string;
  updatedAt?: string;
  expertise?: MentorExpertise[];
  disciplines?: MentorDiscipline[];
  fluency?: MentorFluency[];
  experiences?: MentorExperience[];
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
  mentorExperienceId?: number;
  title?: string;
  companyName?: string;
  companyImage?: string;
  year: string;
  description?: string;
  startDate?: string;  // ISO string
  endDate?: string | null; // null = Present
}

export interface MentorSelfProfile extends Mentor {
  mentorProfileId: number;
  mentorProfileStatus: string;
  verified: boolean;
  location?: string | null;
  yearsExperience?: number | null;
  availableExpertises: MentorLookupOption[];
  availableDisciplines: MentorLookupOption[];
  availableFluencies: MentorLookupOption[];
  scheduling?: MentorSchedulingDetails | null;
}

export interface MentorSelfExperienceInput {
  mentorExperienceId?: number | null;
  title: string;
  description: string;
  companyName?: string | null;
  companyImage?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface UpdateMentorSelfProfileRequest {
  company?: string | null;
  positionTitle?: string | null;
  linkedInUrl?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
  location?: string | null;
  yearsExperience?: number | null;
  expertiseIds: number[];
  disciplineIds: number[];
  fluencyIds: number[];
  experiences: MentorSelfExperienceInput[];
}
