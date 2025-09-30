export interface MenteeExperience {
  title: string;
  description: string;
  year: string;
  companyImage?: string;
}

export interface IMentee {
  id: number;
  name: string;
  role: string;
  title: string;
  company: string;
  avatar: string;
  category?: string;
  description?: string;
  interests?:[],
  disciplines?: [],
  fluentIn?: [],
  experiences?: MenteeExperience[];
}

