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

export interface CalendlyPlatformStatus {
  isConnected: boolean;
  status: string;
  provider?: string | null;
  providerAccountLabel?: string | null;
  connectedAt?: string | null;
  lastRefreshedAt?: string | null;
  lastSyncedAt?: string | null;
  disconnectedAt?: string | null;
  connectedByUserId?: number | null;
  updatedByUserId?: number | null;
  disconnectedByUserId?: number | null;
  canConnect: boolean;
  canReconnect: boolean;
  canDisconnect: boolean;
  canRefresh: boolean;
  canSync: boolean;
  configurationReady: boolean;
  oAuthClientIdConfigured: boolean;
  oAuthClientSecretConfigured: boolean;
  redirectUriConfigured: boolean;
  frontendBaseUrlConfigured: boolean;
  webhookSigningKeyConfigured: boolean;
  activeCredentialsPresent: boolean;
  redirectUri?: string | null;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  apiBaseUrl: string;
  webhookEndpointPath: string;
  configurationMessage?: string | null;
  message: string;
}

export interface CalendlyPlatformDisconnectRequest {
  confirm: boolean;
}

export type CalendlyPlatformOAuthOperation = 'connect' | 'reconnect';

export interface CalendlyPlatformOAuthRequest {
  operation: CalendlyPlatformOAuthOperation;
}

export interface CalendlyPlatformOAuthResponse {
  authorizationUrl: string;
}
