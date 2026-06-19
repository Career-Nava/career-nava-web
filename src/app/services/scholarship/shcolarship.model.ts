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
  benefits?: scholarshipBenefits[] | [];
  menteesInterested: UserModel[] | [];
}

export interface AdminScholarship {
  scholarshipId?: number;
  title?: string;
  link?: string;
  role?: string;
  image?: string;
  category?: string;
  funding?: string;
  status?: string;
  openingDate?: string;
  closingDate?: string;
  deadline?: string;
  description?: string;
  shortDescription?: string;
  benefitsCount?: number;
  interestedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface scholarshipBenefits {
  benefitId?: number;
  benefitText?: string;
}
