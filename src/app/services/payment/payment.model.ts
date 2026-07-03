export interface PaymentInitializationResponse {
  paymentId: number;
  sessionId: number;
  internalReference: string;
  provider: string;
  providerReference?: string | null;
  authorizationUrl?: string | null;
  accessCode?: string | null;
  amount: number;
  currency: string;
  status: string;
  message: string;
}

export interface PaymentVerificationRequest {
  paymentId?: number;
  internalReference?: string;
  providerReference?: string;
}

export interface PaymentVerificationResponse {
  paymentId: number;
  sessionId: number;
  internalReference: string;
  provider: string;
  providerReference?: string | null;
  amount: number;
  currency: string;
  status: string;
  verifiedAt?: string | null;
  message: string;
  sessionStatus: string;
  hasPaidPayment: boolean;
}

export interface AdminPaymentFilters {
  status?: string;
  provider?: string;
  sessionId?: number | null;
  menteeId?: number | null;
  mentorProfileId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
  internalReference?: string | null;
  providerReference?: string | null;
}

export interface AdminPaymentEventFilters {
  paymentId?: number | null;
  provider?: string;
  providerEvent?: string | null;
  eventStatus?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  internalReference?: string | null;
  providerReference?: string | null;
}

export interface AdminPaymentUserSummary {
  userId: number;
  fullName?: string | null;
  email?: string | null;
}

export interface AdminPaymentMentorSummary {
  mentorProfileId?: number | null;
  userId?: number | null;
  fullName?: string | null;
  email?: string | null;
}

export interface AdminPaymentSessionSummary {
  sessionId: number;
  status?: string | null;
  mentorEventTypeId?: number | null;
  eventTypeName?: string | null;
  isFreeSession?: boolean | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  calendlyStartAt?: string | null;
  calendlyEndAt?: string | null;
}

export interface AdminPayment {
  paymentId: number;
  sessionId: number;
  userId: number;
  provider: string;
  internalReference: string;
  providerReference?: string | null;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  mentee?: AdminPaymentUserSummary | null;
  mentor?: AdminPaymentMentorSummary | null;
  session?: AdminPaymentSessionSummary | null;
}

export interface AdminPaymentDetail extends AdminPayment {
  failureReason?: string | null;
}

export interface AdminPaymentEvent {
  paymentEventId: number;
  paymentId?: number | null;
  provider: string;
  providerEvent?: string | null;
  providerReference?: string | null;
  eventStatus: string;
  receivedAt: string;
  processedAt?: string | null;
  processingError?: string | null;
  createdAt: string;
  updatedAt: string;
  paymentInternalReference?: string | null;
  paymentProviderReference?: string | null;
  sessionId?: number | null;
  menteeId?: number | null;
  menteeName?: string | null;
  menteeEmail?: string | null;
}

export interface AdminPaymentEventDetail extends AdminPaymentEvent {}
