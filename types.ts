
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  restaurantAddress: string | null;
}

export interface TerminalGroup {
  organizationId: string;
  items: {
    id: string;
    organizationId: string;
    name: string;
    address: string;
  }[];
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  requestBody: any;
  responseBody: any;
  duration: number;
}

export interface AuthResponse {
  token: string;
}

export interface ErrorResponse {
  errorDescription: string;
  error: string | null;
}
