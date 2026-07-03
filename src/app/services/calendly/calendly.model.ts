export interface AdminCalendlyEventTypeFilters {
  provider?: string;
  assigned?: boolean | null;
  mentorProfileId?: number | null;
  activeStatus?: string | null;
  isFreeSession?: boolean | null;
  search?: string | null;
}

export interface AdminCalendlyMentorSummary {
  mentorProfileId: number;
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  mentorProfileStatus: string;
  verified: boolean;
}

export interface AdminCalendlyEventType {
  eventTypeId: number;
  provider: string;
  uri: string;
  name: string;
  description: string;
  durationMinutes: number;
  color?: string | null;
  activeStatus: string;
  bookingUri: string;
  isFreeSession: boolean;
  priceAmount?: number | null;
  priceCurrency: string;
  assigned: boolean;
  mentor?: AdminCalendlyMentorSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCalendlyEventTypeDetail extends AdminCalendlyEventType {}

export interface AdminCalendlyEventTypeAssignmentUpdate {
  mentorProfileId?: number | null;
}

export interface AdminCalendlyEventTypePricingUpdate {
  isFreeSession?: boolean | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
}
