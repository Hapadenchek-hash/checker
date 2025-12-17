
import { AuthResponse, Organization, TerminalGroup } from '../types';

const BASE_URL = 'https://api-ru.iiko.services/api/1';

export class IikoService {
  private static async request(endpoint: string, options: RequestInit) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      return {
        data,
        status: response.status,
        duration,
        url: `${BASE_URL}${endpoint}`
      };
    } catch (error: any) {
      return {
        data: { errorDescription: error.message },
        status: 500,
        duration: Date.now() - startTime,
        url: `${BASE_URL}${endpoint}`
      };
    }
  }

  static async getAccessToken(apiLogin: string) {
    return this.request('/access_token', {
      method: 'POST',
      body: JSON.stringify({ apiLogin }),
    });
  }

  static async getOrganizations(token: string) {
    return this.request('/organizations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async getTerminalGroups(token: string, organizationIds: string[]) {
    return this.request('/terminal_groups', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ organizationIds }),
    });
  }

  static async getNomenclature(token: string, organizationId: string) {
    return this.request('/nomenclature', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ organizationId }),
    });
  }
}
