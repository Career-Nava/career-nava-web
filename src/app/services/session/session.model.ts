export interface Session {
  sessionId: number;
  menteeId: number;
  menteeName?: string | null;
  menteeEmail?: string | null;
  mentorId: number;
  mentorProfileId?: number;
  mentorEventTypeId?: number | null;
  mentorName?: string | null;
  mentorEmail?: string | null;
  durationMinutes: number;
  status: string;
  calendlyEventUuid?: string | null;
  meetingLink?: string | null;
  calendlyStartAt?: string | null;
  calendlyEndAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Additional session info
  title: string;
  description?: string | null;
  color?: string | null;
  isFreeSession?: boolean | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  isPaymentRequired?: boolean | null;
  hasPaidPayment?: boolean | null;
  paymentStatus?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
}

export interface AdminSession extends Session {
  paymentId?: number | null;
  paymentInternalReference?: string | null;
  paymentProviderReference?: string | null;
  paymentAmount?: number | null;
  paymentCurrency?: string | null;
}

export interface AdminSessionDetail extends AdminSession {
  cancelledAt?: string | null;
  completedAt?: string | null;
  paymentProvider?: string | null;
  paymentPaidAt?: string | null;
  paymentFailedAt?: string | null;
  paymentCancelledAt?: string | null;
  paymentFailureReason?: string | null;
  paymentCreatedAt?: string | null;
  paymentUpdatedAt?: string | null;
}

export interface AdminSessionFilters {
  status?: string;
  mentorProfileId?: number | null;
  menteeId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  paymentStatus?: string;
}
