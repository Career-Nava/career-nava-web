import { IMentee } from "../mentees/IMentees";
import { Mentor } from "../mentors/IMentor";

export interface IScholarships {
  id: number;
  title: string;
  link: string;
  role: string; // e.g. program sponsor, mentor, or facilitator
  imageThumbnail: string;
  date: string | Date; // date posted or available
  applicationDeadline: string | Date;
  time?: string; // optional for sessions/webinars
  sessionDuration?: string; // optional
  reviews: number;
  rating: number;
  category: string; // e.g. "Design", "STEM", "Leadership"
  description: string;
  eligibilityCriteria: string;
  benefits: string[];
  status: 'active' | 'inactive';
  mentor: Mentor;
  menteesInterested: string[]; // mentee avatar URLs who bookmarked
}