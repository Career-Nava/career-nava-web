export interface MentorExperience {
  title: string;
  description: string;
  year: string;
  companyImage?: string;
}

export interface Mentor {
  id: number;
  name: string;
  role: string;
  title: string;
  company: string;
  image: string;
  sessions: number;
  reviews: number;
  rating: number;
  experienceYears: number;
  avgAttendance: string;
  category: string;
  description: string;
  expertise:[],
  disciplines: [],
  fluentIn: [],
  experiences?: MentorExperience[];
}
