import { UserModel } from "../user/user.model";

// Backend DTOs
export interface ScholarshipDto {
  scholarshipId: number;
  title: string;
  link: string;
  role: string;
  imageThumbnail?: string;
  datePosted?: string; // ISO string
  applicationDeadline?: string; // ISO string
  category: string;
  shortDescription: string;
  funding?: 'Fully Funded' | 'Partially Funded' | 'No Funding';
  contentDescription?: string;
  eligibilityCriteria: string;
  status?: 'active' | 'inactive';
  isBookmarked: boolean;
  benefits?: ScholarshipBenefit[] | [];
  menteesInterested: UserModel[] | [];
}

export interface ScholarshipBookmarkDto {
  scholarshipId: number;
  isBookmarked: boolean;
  bookmarkCount: number;
  message: string;
}

export interface AdminScholarship {
  scholarshipId?: number;
  mentorProfileId?: number | null;
  title?: string;
  link?: string;
  role?: string;
  image?: string;
  imageThumbnail?: string;
  category?: string;
  funding?: string;
  status?: string;
  openingDate?: string;
  datePosted?: string;
  closingDate?: string;
  applicationDeadline?: string;
  deadline?: string;
  description?: string;
  contentDescription?: string;
  shortDescription?: string;
  eligibilityCriteria?: string;
  publishedAt?: string | null;
  closedAt?: string | null;
  archivedAt?: string | null;
  benefits?: ScholarshipBenefit[];
  benefitsCount?: number;
  interestedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScholarshipBenefit {
  benefitId?: number;
  scholarshipBenefitId?: number;
  benefitText?: string;
}

export interface AdminScholarshipUpsert {
  mentorProfileId?: number | null;
  title?: string | null;
  link?: string | null;
  role?: string | null;
  imageThumbnail?: string | null;
  datePosted?: string | null;
  applicationDeadline?: string | null;
  category?: string | null;
  shortDescription?: string | null;
  funding?: string | null;
  contentDescription?: string | null;
  eligibilityCriteria?: string | null;
  status?: string | null;
  benefits?: string[] | null;
}
