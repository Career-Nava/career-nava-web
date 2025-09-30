import { IMentee } from "../mentees/IMentees";
import { Mentor } from "../mentors/IMentor";

export interface ISessions {
  id: number;
  title: string;
  link: string;
  role: string;
  imageThumbnail: string;
  date: string | Date;
  time: string;
  sessionDuration: string;
  reviews: number;
  rating: number;
  category: string;
  description: string;
  status: 'active' | 'inactive';
  mentor: Mentor;
  menteesAttending: IMentee[];
}