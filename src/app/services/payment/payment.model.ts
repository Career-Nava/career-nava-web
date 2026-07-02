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
