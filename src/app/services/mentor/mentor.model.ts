export interface Mentor {
  userId?: number;
  authUid?: string;
  fullName: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  passwordHash?: string;
  plainPassword?: string;
  googleId?: string;
  company?: string;
  positionTitle?: string;
  linkedInUrl?: string;
  avgRating?: number;
  totalReviews?: number;
  totalSessions?: number;

  // Newly added keys
  bio: string;           // Short bio or mentor summary
  profilePicture: string;                 // Profile image URL

  expertise: string[];           // Areas of specialization (e.g. "UI/UX", "Cloud")
  disciplines: string[];         // Broader fields or departments (e.g. "Engineering", "Design")
  fluentIn: string[];            // Spoken or programming languages (e.g. "English", "Python")

  experiences: MentorExperience[]; // Work or project experience list
}

export interface MentorExperience {
  title: string;                 // Role or position held
  companyImage: string;          // Company logo or image URL
  year: string;                  // Year or duration (e.g. "2021 - Present")
  description: string;           // Summary of the experience
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
