import { Mentor } from "../mentor/mentor.model";

// DTOs that match the backend
export interface MentorBasicDto {
  userId: number;
  fullName: string;
  email: string;
}

export interface ScholarshipDto {
  scholarshipId: number;
  title: string;
  imageThumbnail: string;
  summary: string;
  description: string;
  funding: string;
  status: string;
  mentor: Mentor;
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// UI model (kept as-is)
export interface Scholarship {
  id: number;
  title: string;
  link: string;
  role: string;
  imageThumbnail: string;
  date: string | Date;
  applicationDeadline: string | Date;
  time?: string;
  sessionDuration?: string;
  reviews: number;
  rating: number;
  category: string;
  shortDescription: string;
  funding: 'Fully Funded' | 'Partially Funded' | 'No Funding';
  contentDescription: string;
  eligibilityCriteria: string;
  benefits: string[];
  status: 'active' | 'inactive';
  isBookmarked: boolean;
  mentor: Mentor;
  menteesInterested: string[];
}
