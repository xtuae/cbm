// Admin API client with automatic authentication
import { supabase } from '../lib/supabase';

export class AdminApi {
  private baseURL: string;

  constructor(baseURL: string = '/api/v1') {
    this.baseURL = baseURL;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      return headers;
    } catch (error) {
      console.error('Error getting session for admin API:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  async get(endpoint: string): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async post(endpoint: string, data?: any): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async delete(endpoint: string): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }
}

export const adminApi = new AdminApi();
