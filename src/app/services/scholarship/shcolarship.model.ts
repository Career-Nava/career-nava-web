import { Mentor } from "../mentor/mentor.model";

// Backend DTOs
export interface ScholarshipDto {
  scholarshipId: number;
  title: string;
  imageThumbnail?: string;
  summary?: string;
  description?: string;
  funding?: 'Fully Funded' | 'Partially Funded' | 'No Funding';
  status?: 'active' | 'inactive';
  mentor?: Mentor;
  date?: string;               // ISO string
  applicationDeadline?: string; // ISO string
  benefits?: string[];
  menteesInterested?: string[];
}

// UI Model
export interface Scholarship {
  id: number;
  title: string;
  link: string;
  role: string;
  imageThumbnail: string;
  date: Date;
  applicationDeadline: Date;
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
  mentor: Mentor | null;
  menteesInterested: string[];
}
